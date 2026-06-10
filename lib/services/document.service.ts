import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const DocumentService = {
  async upload(data: Omit<Prisma.DocumentUncheckedCreateInput, 'version'>) {
    const version = await DocumentService.nextVersionNumber(data.parentDocumentId as number | undefined)

    return prisma.$transaction(async (tx) => {
      if (data.parentDocumentId) {
        await tx.document.updateMany({
          where: {
            OR: [
              { id: data.parentDocumentId },
              { parentDocumentId: data.parentDocumentId },
            ],
          },
          data: { isLatestVersion: false },
        })
      }

      return tx.document.create({
        data: { ...data, version, isLatestVersion: true },
        include: { department: true, uploader: true },
      })
    })
  },

  async nextVersionNumber(parentDocumentId?: number): Promise<number> {
    if (!parentDocumentId) return 1

    const max = await prisma.document.aggregate({
      where: {
        OR: [{ id: parentDocumentId }, { parentDocumentId }],
      },
      _max: { version: true },
    })

    return (max._max.version ?? 0) + 1
  },

  async getVersionHistory(documentId: number) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) return []

    const rootId = doc.parentDocumentId ?? doc.id

    return prisma.document.findMany({
      where: {
        OR: [{ id: rootId }, { parentDocumentId: rootId }],
      },
      orderBy: { version: 'asc' },
      include: { uploader: true },
    })
  },
}
