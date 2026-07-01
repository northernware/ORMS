import React from 'react'
import { ResolutionService } from '@/lib/services/resolution.service'
import { getSession } from '@/lib/session'
import { DataTable, DataTableRow, DataTableCell } from '@/app/components/DataTable'
import { StatusBadge } from '@/app/components/StatusBadge'
import { SearchFilter } from '@/app/components/SearchFilter'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ResolutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined

  const { data: resolutions, meta } = await ResolutionService.list({ page, search }, session)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Resolutions</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Track resolutions through hearings, Vice Mayor, and Mayor approval.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchFilter placeholder="Search resolutions..." />
          <Link href="/admin/resolutions/create" className="btn-primary flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Resolution
          </Link>
        </div>
      </div>

      <DataTable columns={['Number', 'Title', 'Department', 'Year', 'Status', 'Date', 'Actions']}>
        {resolutions.map((res: any) => (
          <DataTableRow key={res.id}>
            <DataTableCell className="font-medium">{res.resolutionNumber}</DataTableCell>
            <DataTableCell>
              <div className="max-w-[300px] truncate" title={res.title}>{res.title}</div>
            </DataTableCell>
            <DataTableCell>{res.responsibleDepartment.name}</DataTableCell>
            <DataTableCell>{res.year}</DataTableCell>
            <DataTableCell>
              <StatusBadge status={res.status} />
            </DataTableCell>
            <DataTableCell>{formatDate(res.createdAt)}</DataTableCell>
            <DataTableCell>
              <div className="flex items-center gap-2">
                <Link href={`/admin/resolutions/${res.id}`} className="p-1 text-zinc-400 hover:text-sky-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </DataTableCell>
          </DataTableRow>
        ))}
        {resolutions.length === 0 && (
          <DataTableRow>
            <DataTableCell className="text-center py-8 text-zinc-500">
              No resolutions found.
            </DataTableCell>
          </DataTableRow>
        )}
      </DataTable>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-medium">{(meta.currentPage - 1) * meta.perPage + 1}</span> to{' '}
          <span className="font-medium">{Math.min(meta.currentPage * meta.perPage, meta.total)}</span> of{' '}
          <span className="font-medium">{meta.total}</span> results
        </p>
        <div className="flex gap-2">
          <Link
            href={`?page=${Math.max(1, meta.currentPage - 1)}${search ? `&search=${search}` : ''}`}
            className={`btn-secondary ${meta.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Previous
          </Link>
          <Link
            href={`?page=${Math.min(meta.lastPage, meta.currentPage + 1)}${search ? `&search=${search}` : ''}`}
            className={`btn-secondary ${meta.currentPage >= meta.lastPage ? 'pointer-events-none opacity-50' : ''}`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  )
}
