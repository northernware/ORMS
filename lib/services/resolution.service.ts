import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { logAudit } from '@/lib/utils/audit'
import {
  canRecordHearings,
  canViceMayorApprove,
  canMayorApprove,
} from '@/lib/utils/permissions'
import type { ResolutionStatus, PaginatedResponse, UserContext } from '@/types'

// Roles that may read resolutions across all departments.
function canViewAllResolutions(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'Vice_Mayor' || user.role === 'Mayor'
}

export interface ResolutionFilters {
  year?: number
  departmentId?: number
  status?: ResolutionStatus
  search?: string
  page?: number
  perPage?: number
}

function isComplete(r: { who: string | null; what: string | null; when: Date | null; where: string | null; why: string | null; how: string | null }) {
  return !!(r.who && r.what && r.when && r.where && r.why && r.how)
}

export const ResolutionService = {
  async list(filters: ResolutionFilters, user: UserContext): Promise<PaginatedResponse<any>> {
    const { year, departmentId, status, search, page = 1, perPage = 15 } = filters
    const skip = (page - 1) * perPage

    const viewAll = canViewAllResolutions(user)
    const where: Prisma.ResolutionWhereInput = {}

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
      ]
    }

    const [items, total] = await Promise.all([
      prisma.resolution.findMany({
        where,
        include: { responsibleDepartment: true, creator: true, updater: true },
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
      include: { responsibleDepartment: true, creator: true, updater: true, documents: true },
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

  // Stage 1: author submits a complete draft (or a sent-back resolution) into the hearings stage.
  // Resubmission after a Vice Mayor send-back opens a fresh hearing cycle.
  async submitForHearings(id: number, user: UserContext, ipAddress?: string, userAgent?: string) {
    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')

    if (user.role === 'Staff') throw new Error('FORBIDDEN')
    if (
      !canViewAllResolutions(user) &&
      user.departmentId &&
      resolution.responsibleDepartmentId !== user.departmentId &&
      resolution.createdBy !== user.id
    ) {
      throw new Error('FORBIDDEN')
    }
    if (resolution.status !== 'draft' && resolution.status !== 'rejected') throw new Error('INVALID_STATUS')
    if (!isComplete(resolution)) throw new Error('INCOMPLETE_RECORD')

    const nextCycle = resolution.status === 'rejected' ? resolution.hearingCycle + 1 : resolution.hearingCycle

    const updated = await prisma.resolution.update({
      where: { id },
      data: { status: 'in_hearings', hearingCycle: nextCycle, feedback: null, updatedBy: user.id },
    })

    await logAudit({
      userId: user.id,
      action: 'SUBMIT_FOR_HEARINGS',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: resolution.status },
      newValues: { status: 'in_hearings', hearingCycle: nextCycle },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Stage 2: the secretariat records each of the three hearings/readings.
  // The third hearing automatically advances the resolution to the Vice Mayor.
  async recordHearing(
    id: number,
    data: { heldAt?: Date | null; minutes?: string | null; notes?: string | null },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canRecordHearings(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'in_hearings') throw new Error('INVALID_STATUS')

    const priorCount = await prisma.hearing.count({
      where: { resolutionId: id, cycle: resolution.hearingCycle },
    })
    if (priorCount >= 3) throw new Error('HEARINGS_COMPLETE')
    const hearingNumber = priorCount + 1

    const result = await prisma.$transaction(async (tx) => {
      const hearing = await tx.hearing.create({
        data: {
          resolutionId: id,
          cycle: resolution.hearingCycle,
          hearingNumber,
          heldAt: data.heldAt ?? null,
          minutes: data.minutes ?? null,
          notes: data.notes ?? null,
          recordedBy: user.id,
        },
      })

      const updated =
        hearingNumber === 3
          ? await tx.resolution.update({
              where: { id },
              data: { status: 'pending_vice_mayor', updatedBy: user.id },
            })
          : resolution

      return { hearing, resolution: updated }
    })

    await logAudit({
      userId: user.id,
      action: 'RECORD_HEARING',
      tableName: 'resolutions',
      recordId: id,
      newValues: {
        cycle: resolution.hearingCycle,
        hearingNumber,
        advancedTo: hearingNumber === 3 ? 'pending_vice_mayor' : null,
      },
      ipAddress,
      userAgent,
    })

    return result
  },

  async listHearings(id: number, user: UserContext) {
    // Reuse findById for access scoping (throws FORBIDDEN / returns null when appropriate).
    const resolution = await ResolutionService.findById(id, user)
    if (!resolution) throw new Error('NOT_FOUND')

    return prisma.hearing.findMany({
      where: { resolutionId: id },
      include: { recorder: true },
      orderBy: [{ cycle: 'asc' }, { hearingNumber: 'asc' }],
    })
  },

  // Stage 3: Vice Mayor (presiding officer) approves or sends back for revision.
  async viceMayorApprove(id: number, user: UserContext, ipAddress?: string, userAgent?: string) {
    if (!canViceMayorApprove(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'pending_vice_mayor') throw new Error('INVALID_STATUS')

    const updated = await prisma.resolution.update({
      where: { id },
      data: { status: 'pending_mayor', updatedBy: user.id },
    })

    await logAudit({
      userId: user.id,
      action: 'VICE_MAYOR_APPROVE',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: 'pending_vice_mayor' },
      newValues: { status: 'pending_mayor' },
      ipAddress,
      userAgent,
    })

    return updated
  },

  async viceMayorReject(id: number, user: UserContext, reason?: string, ipAddress?: string, userAgent?: string) {
    if (!canViceMayorApprove(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'pending_vice_mayor') throw new Error('INVALID_STATUS')

    const updated = await prisma.resolution.update({
      where: { id },
      data: { status: 'rejected', feedback: reason ?? null, updatedBy: user.id },
    })

    await logAudit({
      userId: user.id,
      action: 'VICE_MAYOR_REJECT',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: 'pending_vice_mayor' },
      newValues: { status: 'rejected', feedback: reason ?? null },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // Stage 4: Mayor (local chief executive) gives final approval or a terminal veto.
  async mayorApprove(id: number, user: UserContext, ipAddress?: string, userAgent?: string) {
    if (!canMayorApprove(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'pending_mayor') throw new Error('INVALID_STATUS')

    const updated = await prisma.resolution.update({
      where: { id },
      data: { status: 'active', updatedBy: user.id },
    })

    await logAudit({
      userId: user.id,
      action: 'MAYOR_APPROVE',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: 'pending_mayor' },
      newValues: { status: 'active' },
      ipAddress,
      userAgent,
    })

    return updated
  },

  // A Mayor veto is terminal — the resolution cannot be resubmitted.
  async mayorVeto(id: number, user: UserContext, reason?: string, ipAddress?: string, userAgent?: string) {
    if (!canMayorApprove(user)) throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'pending_mayor') throw new Error('INVALID_STATUS')

    const updated = await prisma.resolution.update({
      where: { id },
      data: { status: 'vetoed', feedback: reason ?? null, updatedBy: user.id },
    })

    await logAudit({
      userId: user.id,
      action: 'MAYOR_VETO',
      tableName: 'resolutions',
      recordId: id,
      oldValues: { status: 'pending_mayor' },
      newValues: { status: 'vetoed', feedback: reason ?? null },
      ipAddress,
      userAgent,
    })

    return updated
  },
}
