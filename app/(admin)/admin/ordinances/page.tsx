import React from 'react'
import { OrdinanceService } from '@/lib/services/ordinance.service'
import { getSession } from '@/lib/session'
import { DataTable, DataTableRow, DataTableCell } from '@/app/components/DataTable'
import { StatusBadge } from '@/app/components/StatusBadge'
import { SearchFilter } from '@/app/components/SearchFilter'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function OrdinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined

  const { data: ordinances, meta } = await OrdinanceService.list({ page, search }, session)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ordinances</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Ordinance requests from the municipality — decided directly by the Mayor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchFilter placeholder="Search ordinances..." />
          <Link href="/admin/ordinances/create" className="btn-primary flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Receive Request
          </Link>
        </div>
      </div>

      <DataTable columns={['Number', 'Title', 'Requested By', 'Year', 'Status', 'Date', 'Actions']}>
        {ordinances.map((ord: any) => (
          <DataTableRow key={ord.id}>
            <DataTableCell className="font-mono text-[0.8rem] font-medium">{ord.ordinanceNumber}</DataTableCell>
            <DataTableCell>
              <div className="max-w-[300px] truncate" title={ord.title}>{ord.title}</div>
            </DataTableCell>
            <DataTableCell>{ord.requestedBy || ord.department.name}</DataTableCell>
            <DataTableCell>{ord.year}</DataTableCell>
            <DataTableCell>
              <StatusBadge status={ord.status} />
            </DataTableCell>
            <DataTableCell>{formatDate(ord.createdAt)}</DataTableCell>
            <DataTableCell>
              <div className="flex items-center gap-2">
                <Link href={`/admin/ordinances/${ord.id}`} className="p-1 text-zinc-400 hover:text-sky-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </Link>
                <Link href={`/admin/ordinances/${ord.id}/edit`} className="p-1 text-zinc-400 hover:text-indigo-600 transition-colors">
                  <Edit className="h-4 w-4" />
                </Link>
                <button className="p-1 text-zinc-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </DataTableCell>
          </DataTableRow>
        ))}
        {ordinances.length === 0 && (
          <DataTableRow>
            <DataTableCell className="text-center py-8 text-zinc-500">
              No ordinances found.
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
