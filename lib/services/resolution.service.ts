import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { logAudit } from '@/lib/utils/audit'
import { canRecordResolutionFlow, canViewAllResolutions } from '@/lib/utils/permissions'
import type { ResolutionStatus, PaginatedResponse, UserContext } from '@/types'

export interface ResolutionFilters {
  year?: number
  departmentId?: number
  status?: ResolutionStatus
  search?: string
  page?: number
  perPage?: number
}

export const ResolutionService = {
  async list(filters: ResolutionFilters, user: UserContext): Promise<PaginatedResponse<any>> {
    const { year, departmentId, status, search, page = 1, perPage = 15 } = filters
    const skip = (page - 1) * perPage

    const viewAll = canViewAllResolutions(user)
    const where: Prisma.ResolutionWhereInput = {}

    // Department users see only their own office's requests.
    if (!viewAll) {
      if (user.departmentId) {
        where.responsibleDepartmentId = user.departmentId
      } else {
        where.createdBy = user.id
      }
    }

    if (year) where.year = year
    if (departmentId && (viewAll || departmentId === user.departmentId)) {
      where.responsibleDepartmentId = departmentId
    }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { resolutionNumber: { contains: search } },
        { requestedBy: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.resolution.findMany({
        where,
        include: {
          responsibleDepartment: true,
          creator: true,
          updater: true,
          referrals: { include: { committee: true }, orderBy: { referredAt: 'desc' } },
        },
        skip,
        take: Math.min(perPage, 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resolution.count({ where }),
    ])

    return {
      data: items,
      meta: { currentPage: page, perPage, total, lastPage: Math.ceil(total / perPage) },
    }
  },

  async create(data: Prisma.ResolutionUncheckedCreateInput, ipAddress?: string, userAgent?: string) {
    const resolution = await prisma.resolution.create({
      data,
      include: { responsibleDepartment: true, creator: true, updater: true },
    })

    await logAudit({
      userId: data.createdBy,
      action: 'CREATE',
      tableName: 'resolutions',
      recordId: resolution.id,
      newValues: resolution as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    })

    return resolution
  },

  async findById(id: number, user: UserContext) {
    const resolution = await prisma.resolution.findUnique({
      where: { id },
      include: {
        responsibleDepartment: true,
        creator: true,
        updater: true,
        documents: true,
        calendarItems: { orderBy: { sessionDate: 'asc' } },
        referrals: { include: { committee: { include: { members: true } } }, orderBy: { referredAt: 'desc' } },
      },
    })

    if (!resolution) return null

    if (!canViewAllResolutions(user)) {
      if (user.departmentId && resolution.responsibleDepartmentId !== user.departmentId && resolution.createdBy !== user.id) {
        throw new Error('FORBIDDEN')
      }
    }

    return resolution
  },

  async update(id: number, data: Prisma.ResolutionUncheckedUpdateInput, user: UserContext, ipAddress?: string, userAgent?: string) {
    const existing = await ResolutionService.findById(id, user)
    if (!existing) throw new Error('NOT_FOUND')

    const updated = await prisma.resolution.update({
      where: { id },
      data: { ...data, updatedBy: user.id },
      include: { responsibleDepartment: true, creator: true, updater: true },
    })

    await logAudit({
      userId: user.id,
      action: 'UPDATE',
      tableName: 'resolutions',
      recordId: id,
      oldValues: existing as unknown as Record<string, unknown>,
      newValues: updated as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    })

    return updated
  },

  async softDelete(id: number, user: UserContext) {
    const existing = await ResolutionService.findById(id, user)
    if (!existing) throw new Error('NOT_FOUND')

    return prisma.resolution.update({
      where: { id },
      data: { status: 'inactive', updatedBy: user.id },
    })
  },

  // Stage 1: SB office places the received request on the Calendar of
  // Business for a regular session (where it will be referred to committee).
  async placeOnCalendar(
    id: number,
    data: { sessionDate: Date; remarks?: string | null },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canRecordResolutionFlow(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'request_received') throw new Error('INVALID_STATUS')

    const updated = await prisma.$transaction(async (tx) => {
      await tx.calendarItem.create({
        data: { resolutionId: id, purpose: 'referral', sessionDate: data.sessionDate, remarks: data.remarks ?? null },
      })
      return tx.resolution.update({
        where: { id },
        data: { status: 'calendared', updatedBy: user.id },
      })
    })

    await logAudit({
      userId: user.id,
      action: 'PLACE_ON_CALENDAR',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: resolution.status },
      newValues: { status: 'calendared', sessionDate: data.sessionDate },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Stage 2: in regular session the SB refers the matter to one of the 11
  // standing committees for committee hearing.
  async referToCommittee(
    id: number,
    data: { committeeId: number; referredAt?: Date | null },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canRecordResolutionFlow(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'calendared') throw new Error('INVALID_STATUS')

    const committee = await prisma.committee.findUnique({ where: { id: data.committeeId } })
    if (!committee || !committee.isActive) throw new Error('COMMITTEE_NOT_FOUND')

    const updated = await prisma.$transaction(async (tx) => {
      await tx.committeeReferral.create({
        data: {
          resolutionId: id,
          committeeId: data.committeeId,
          referredAt: data.referredAt ?? new Date(),
        },
      })
      return tx.resolution.update({
        where: { id },
        data: { status: 'in_committee', updatedBy: user.id },
      })
    })

    await logAudit({
      userId: user.id,
      action: 'REFER_TO_COMMITTEE',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: resolution.status },
      newValues: { status: 'in_committee', committee: committee.name },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Stage 3: after the committee hearing, the committee report (findings and
  // recommendation) goes back on the Calendar of Business for adoption.
  async submitCommitteeReport(
    id: number,
    data: { findings?: string | null; recommendation: string; hearingHeldAt?: Date | null; sessionDate: Date },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canRecordResolutionFlow(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({
      where: { id },
      include: { referrals: { orderBy: { referredAt: 'desc' }, take: 1 } },
    })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'in_committee') throw new Error('INVALID_STATUS')

    const referral = resolution.referrals[0]
    if (!referral) throw new Error('NO_REFERRAL')

    const updated = await prisma.$transaction(async (tx) => {
      await tx.committeeReferral.update({
        where: { id: referral.id },
        data: {
          hearingHeldAt: data.hearingHeldAt ?? null,
          reportFindings: data.findings ?? null,
          reportRecommendation: data.recommendation,
          reportSubmittedAt: new Date(),
        },
      })
      await tx.calendarItem.create({
        data: { resolutionId: id, purpose: 'adoption', sessionDate: data.sessionDate },
      })
      return tx.resolution.update({
        where: { id },
        data: { status: 'for_adoption', updatedBy: user.id },
      })
    })

    await logAudit({
      userId: user.id,
      action: 'SUBMIT_COMMITTEE_REPORT',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: resolution.status },
      newValues: { status: 'for_adoption', recommendation: data.recommendation },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Stage 4: the whole SB membership acts on the committee report in regular
  // session. Only the outcome is recorded — the vote happens on the floor.
  async recordAdoption(
    id: number,
    data: { outcome: 'adopted' | 'not_adopted'; decidedAt?: Date | null; remarks?: string | null },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canRecordResolutionFlow(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'for_adoption') throw new Error('INVALID_STATUS')

    const updated = await prisma.resolution.update({
      where: { id },
      data: {
        status: data.outcome,
        adoptedAt: data.outcome === 'adopted' ? data.decidedAt ?? new Date() : null,
        remarks: data.remarks ?? null,
        updatedBy: user.id,
      },
    })

    await logAudit({
      userId: user.id,
      action: data.outcome === 'adopted' ? 'RECORD_ADOPTION' : 'RECORD_NON_ADOPTION',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: resolution.status },
      newValues: { status: data.outcome, remarks: data.remarks ?? null },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Stage 5: the Mayor signs the adopted resolution and the requester is
  // notified. SB staff record both dates.
  async recordSignature(
    id: number,
    data: { signedAt?: Date | null; requesterNotifiedAt?: Date | null },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canRecordResolutionFlow(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'adopted') throw new Error('INVALID_STATUS')

    const updated = await prisma.resolution.update({
      where: { id },
      data: {
        status: 'signed',
        signedAt: data.signedAt ?? new Date(),
        requesterNotifiedAt: data.requesterNotifiedAt ?? null,
        updatedBy: user.id,
      },
    })

    await logAudit({
      userId: user.id,
      action: 'RECORD_MAYOR_SIGNATURE',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: resolution.status },
      newValues: { status: 'signed', signedAt: updated.signedAt, requesterNotifiedAt: updated.requesterNotifiedAt },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Calendar of Business: all agenda entries, newest session first.
  async listCalendar() {
    return prisma.calendarItem.findMany({
      include: {
        resolution: {
          include: {
            responsibleDepartment: true,
            referrals: { include: { committee: true }, orderBy: { referredAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: [{ sessionDate: 'desc' }, { createdAt: 'asc' }],
    })
  },
}
