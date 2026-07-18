import { prisma } from '@/lib/db'

export const ReportingService = {
  async getOrdinanceCountsByYear(startYear?: number, endYear?: number): Promise<{ year: number; total: number }[]> {
    const results = await prisma.ordinance.groupBy({
      by: ['year'],
      _count: { id: true },
      where: {
        year: { gte: startYear, lte: endYear },
      },
      orderBy: { year: 'asc' },
    })
    return results.map((r) => ({ year: r.year, total: r._count.id }))
  },

  async getOrdinanceCountsByDepartment(departmentId?: number): Promise<{ department: string; total: number }[]> {
    const results = await prisma.ordinance.groupBy({
      by: ['departmentId'],
      _count: { id: true },
      where: departmentId ? { departmentId } : undefined,
    })

    const departments = await prisma.department.findMany({
      where: { id: { in: results.map((r) => r.departmentId) } },
    })

    return results.map((r) => ({
      department: departments.find((d) => d.id === r.departmentId)?.name ?? 'Unknown',
      total: r._count.id,
    }))
  },

  async getResolutionCountsByStatus(): Promise<{ status: string; total: number }[]> {
    const results = await prisma.resolution.groupBy({
      by: ['status'],
      _count: { id: true },
    })
    return results.map((r) => ({ status: r.status, total: r._count.id }))
  },

  async getSummaryTotals(): Promise<{
    ordinances: { total: number; approved: number; pending: number };
    resolutions: { total: number; byStatus: { status: string; total: number }[] };
    documents: { total: number; latestVersions: number; totalStorageBytes: number };
  }> {
    const [
      totalOrdinances,
      approvedOrdinances,
      pendingOrdinances,
      totalResolutions,
      totalDocuments,
      latestDocuments,
      totalStorageResult,
    ] = await Promise.all([
      prisma.ordinance.count(),
      prisma.ordinance.count({ where: { status: 'approved' } }),
      prisma.ordinance.count({ where: { status: 'request_received' } }),
      prisma.resolution.count(),
      prisma.document.count(),
      prisma.document.count({ where: { isLatestVersion: true } }),
      prisma.document.aggregate({ _sum: { fileSize: true } }),
    ])

    return {
      ordinances: {
        total: totalOrdinances,
        approved: approvedOrdinances,
        pending: pendingOrdinances,
      },
      resolutions: {
        total: totalResolutions,
        byStatus: await ReportingService.getResolutionCountsByStatus(),
      },
      documents: {
        total: totalDocuments,
        latestVersions: latestDocuments,
        totalStorageBytes: Number(totalStorageResult._sum.fileSize ?? 0),
      },
    }
  },
}
