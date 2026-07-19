import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { logAudit } from '@/lib/utils/audit'
import { canManageOrdinances, canViewAllOrdinances } from '@/lib/utils/permissions'
import type { OrdinanceStatus, PaginatedResponse, UserContext } from '@/types'

export interface OrdinanceFilters {
  year?: number
  departmentId?: number
  status?: OrdinanceStatus
  search?: string
  page?: number
  perPage?: number
}

export const OrdinanceService = {
  async list(filters: OrdinanceFilters, user: UserContext): Promise<PaginatedResponse<any>> {
    const { year, departmentId, status, search, page = 1, perPage = 15 } = filters
    const skip = (page - 1) * perPage

    const viewAll = canViewAllOrdinances(user)
    const where: Prisma.OrdinanceWhereInput = {}

    if (!viewAll) {
      if (user.departmentId) {
        where.departmentId = user.departmentId
      } else {
        where.createdBy = user.id
      }
    }

    if (year) where.year = year
    if (departmentId && (viewAll || departmentId === user.departmentId)) {
      where.departmentId = departmentId
    }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } }, // SQLite doesn't support mode: 'insensitive' with Prisma
        { summary: { contains: search } },
        { ordinanceNumber: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.ordinance.findMany({
        where,
        include: { department: true, creator: true, updater: true },
        skip,
        take: Math.min(perPage, 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ordinance.count({ where }),
    ])

    return {
      data: items,
      meta: {
        currentPage: page,
        perPage,
        total,
        lastPage: Math.ceil(total / perPage),
      },
    }
  },

  async create(data: Prisma.OrdinanceUncheckedCreateInput, ipAddress?: string, userAgent?: string) {
    const ordinance = await prisma.ordinance.create({
      data,
      include: { department: true, creator: true, updater: true },
    })

    await logAudit({
      userId: data.createdBy,
      action: 'CREATE',
      tableName: 'ordinances',
      recordId: ordinance.id,
      newValues: ordinance as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    })

    return ordinance
  },

  async findById(id: number, user: UserContext) {
    const ordinance = await prisma.ordinance.findUnique({
      where: { id },
      include: { department: true, creator: true, updater: true, documents: true },
    })

    if (!ordinance) return null

    if (!canViewAllOrdinances(user)) {
      if (user.departmentId && ordinance.departmentId !== user.departmentId && ordinance.createdBy !== user.id) {
        throw new Error('FORBIDDEN')
      }
    }

    return ordinance
  },

  async update(
    id: number,
    data: Prisma.OrdinanceUncheckedUpdateInput,
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await OrdinanceService.findById(id, user)
    if (!existing) throw new Error('NOT_FOUND')

    const updated = await prisma.ordinance.update({
      where: { id },
      data: { ...data, updatedBy: user.id },
      include: { department: true, creator: true, updater: true },
    })

    await logAudit({
      userId: user.id,
      action: 'UPDATE',
      tableName: 'ordinances',
      recordId: id,
      oldValues: existing as unknown as Record<string, unknown>,
      newValues: updated as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    })

    return updated
  },

  async softDelete(id: number, user: UserContext) {
    const existing = await OrdinanceService.findById(id, user)
    if (!existing) throw new Error('NOT_FOUND')

    return prisma.ordinance.update({
      where: { id },
      data: { status: 'inactive', updatedBy: user.id },
    })
  },

  // The Mayor decides on the request directly — no hearing, no vote.
  // Approval means a MOA right away; staff record the decision.
  async recordMayorDecision(
    id: number,
    data: { decision: 'approved' | 'declined'; decidedAt?: Date | null; remarks?: string | null },
    user: UserContext,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!canManageOrdinances(user)) throw new Error('FORBIDDEN')

    // findById enforces department scoping — a Department_Head may only
    // record decisions on their own department's requests.
    const ordinance = await OrdinanceService.findById(id, user)
    if (!ordinance) throw new Error('NOT_FOUND')
    if (ordinance.status !== 'request_received') throw new Error('INVALID_STATUS')

    const updated = await prisma.ordinance.update({
      where: { id },
      data: {
        status: data.decision,
        decidedAt: data.decidedAt ?? new Date(),
        remarks: data.remarks ?? null,
        updatedBy: user.id,
      },
    })

    await logAudit({
      userId: user.id,
      action: data.decision === 'approved' ? 'MAYOR_APPROVE_ORDINANCE' : 'MAYOR_DECLINE_ORDINANCE',
      tableName: 'ordinances',
      recordId: id,
      oldValues: { status: ordinance.status },
      newValues: { status: data.decision, decidedAt: updated.decidedAt, remarks: data.remarks ?? null },
      ipAddress,
      userAgent,
    })

    return updated
  },

  getFiveWOneH(ordinance: { who: string | null; what: string | null; when: Date | null; where: string | null; why: string | null; how: string | null }) {
    return {
      who: ordinance.who,
      what: ordinance.what,
      when: ordinance.when?.toISOString().split('T')[0] ?? null,
      where: ordinance.where,
      why: ordinance.why,
      how: ordinance.how,
    }
  },
}
