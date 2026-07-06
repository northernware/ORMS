import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { canViewAllDepartments } from '@/lib/utils/permissions'
import { DataTable, DataTableRow, DataTableCell } from '@/app/components/DataTable'
import { formatDate, formatFileSize } from '@/lib/utils/format'
import type { Prisma } from '@prisma/client'

export default async function DocumentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Administrators see all documents; others are scoped to their department.
  const where: Prisma.DocumentWhereInput = { isLatestVersion: true }
  if (!canViewAllDepartments(session) && session.departmentId) {
    where.departmentId = session.departmentId
  }

  const documents = await prisma.document.findMany({
    where,
    include: { uploader: true, department: true, ordinance: true, resolution: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Documents</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Files attached to ordinances and resolutions.</p>
      </div>

      <DataTable columns={['Filename', 'Type', 'Linked To', 'Version', 'Uploaded By', 'Size', 'Date']}>
        {documents.map((doc) => {
          const linkedTo = doc.ordinance
            ? `Ordinance ${doc.ordinance.ordinanceNumber}`
            : doc.resolution
            ? `Resolution ${doc.resolution.resolutionNumber}`
            : doc.department?.name ?? '—'
          return (
            <DataTableRow key={doc.id}>
              <DataTableCell className="font-medium">
                <div className="max-w-[240px] truncate" title={doc.filename}>{doc.filename}</div>
              </DataTableCell>
              <DataTableCell className="text-zinc-500">{doc.documentType ?? '—'}</DataTableCell>
              <DataTableCell>{linkedTo}</DataTableCell>
              <DataTableCell>v{doc.version}</DataTableCell>
              <DataTableCell>{doc.uploader.name}</DataTableCell>
              <DataTableCell className="text-zinc-500">{formatFileSize(doc.fileSize)}</DataTableCell>
              <DataTableCell className="text-zinc-500">{formatDate(doc.createdAt)}</DataTableCell>
            </DataTableRow>
          )
        })}
        {documents.length === 0 && (
          <DataTableRow>
            <DataTableCell className="text-center py-8 text-zinc-500">No documents found.</DataTableCell>
          </DataTableRow>
        )}
      </DataTable>
    </div>
  )
}
