import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { logAudit } from '@/lib/utils/audit'
import type { ResolutionStatus, PaginatedResponse, UserContext } from '@/types'

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

    const isAdmin = user.role === 'Administrator'
    const where: Prisma.ResolutionWhereInput = {}

    if (!isAdmin) {
      if (user.departmentId) {
        where.responsibleDepartmentId = user.departmentId
      } else {
        where.createdBy = user.id
      }
    }

    if (year) where.year = year
    if (departmentId && (isAdmin || departmentId === user.departmentId)) {
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

    const isAdmin = user.role === 'Administrator'
    if (!isAdmin) {
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

  async submitForApproval(id: number, user: UserContext) {
    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'draft') throw new Error('INVALID_STATUS')

    if (user.role === 'Staff') throw new Error('FORBIDDEN')
    if (!isComplete(resolution)) throw new Error('INCOMPLETE_RECORD')

    return prisma.resolution.update({
      where: { id },
      data: { status: 'pending_approval', updatedBy: user.id },
    })
  },

  async approve(id: number, user: UserContext) {
    if (user.role !== 'Administrator') throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'pending_approval') throw new Error('INVALID_STATUS')

    return prisma.resolution.update({
      where: { id },
      data: { status: 'active', updatedBy: user.id },
    })
  },

  async reject(id: number, user: UserContext, reason?: string) {
    if (user.role !== 'Administrator') throw new Error('FORBIDDEN')

    const resolution = await prisma.resolution.findUnique({ where: { id } })
    if (!resolution) throw new Error('NOT_FOUND')
    if (resolution.status !== 'pending_approval') throw new Error('INVALID_STATUS')

    return prisma.resolution.update({
      where: { id },
      data: { status: 'rejected', feedback: reason, updatedBy: user.id },
    })
  },
}
