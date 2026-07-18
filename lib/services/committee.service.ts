import { prisma } from '@/lib/db'

export const CommitteeService = {
  // The 11 standing committees with their five-seat composition.
  async list() {
    return prisma.committee.findMany({
      where: { isActive: true },
      include: {
        members: { orderBy: { id: 'asc' } },
        _count: { select: { referrals: true } },
      },
      orderBy: { name: 'asc' },
    })
  },
}
