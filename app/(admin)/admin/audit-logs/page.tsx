import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { canViewAuditLogs } from '@/lib/utils/permissions'
import { DataTable, DataTableRow, DataTableCell } from '@/app/components/DataTable'
import { formatDateTime } from '@/lib/utils/format'
import type { Prisma } from '@prisma/client'

const PER_PAGE = 25

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canViewAuditLogs(session)) redirect('/admin')

  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? Math.max(1, Number(resolvedParams.page)) : 1

  // Administrators see everything; Department Heads see only their department's activity.
  const where: Prisma.AuditLogWhereInput =
    session.role === 'Administrator' || !session.departmentId
      ? {}
      : { user: { departmentId: session.departmentId } }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.auditLog.count({ where }),
  ])
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Audit Logs</h2>
        <p className="text-zinc-500 dark:text-zinc-400">A chronological record of changes across the system.</p>
      </div>

      <DataTable columns={['Timestamp', 'User', 'Action', 'Record', 'IP Address']}>
        {logs.map((log) => (
          <DataTableRow key={log.id}>
            <DataTableCell className="whitespace-nowrap text-zinc-500">{formatDateTime(log.createdAt)}</DataTableCell>
            <DataTableCell>{log.user?.name ?? 'System'}</DataTableCell>
            <DataTableCell>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {log.action}
              </span>
            </DataTableCell>
            <DataTableCell className="text-zinc-600 dark:text-zinc-400">
              {log.tableName} #{log.recordId}
            </DataTableCell>
            <DataTableCell className="text-zinc-500">{log.ipAddress ?? '—'}</DataTableCell>
          </DataTableRow>
        ))}
        {logs.length === 0 && (
          <DataTableRow>
            <DataTableCell className="text-center py-8 text-zinc-500">No audit logs found.</DataTableCell>
          </DataTableRow>
        )}
      </DataTable>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Page <span className="font-medium">{page}</span> of <span className="font-medium">{lastPage}</span> ·{' '}
          <span className="font-medium">{total}</span> entries
        </p>
        <div className="flex gap-2">
          <a href={`?page=${Math.max(1, page - 1)}`} className={`btn-secondary ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}>
            Previous
          </a>
          <a href={`?page=${Math.min(lastPage, page + 1)}`} className={`btn-secondary ${page >= lastPage ? 'pointer-events-none opacity-50' : ''}`}>
            Next
          </a>
        </div>
      </div>
    </div>
  )
}
