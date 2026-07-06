import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { canManageUsers } from '@/lib/utils/permissions'
import { DataTable, DataTableRow, DataTableCell } from '@/app/components/DataTable'
import { StatusBadge } from '@/app/components/StatusBadge'
import { formatDate } from '@/lib/utils/format'

export default async function UsersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canManageUsers(session)) redirect('/admin')

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: { department: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Users</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Accounts with access to the system and their roles.</p>
      </div>

      <DataTable columns={['Name', 'Email', 'Role', 'Department', 'Joined', 'Status']}>
        {users.map((user) => (
          <DataTableRow key={user.id}>
            <DataTableCell className="font-medium">{user.name}</DataTableCell>
            <DataTableCell className="text-zinc-500">{user.email}</DataTableCell>
            <DataTableCell>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                {user.role.replace('_', ' ')}
              </span>
            </DataTableCell>
            <DataTableCell>{user.department?.name ?? '—'}</DataTableCell>
            <DataTableCell className="text-zinc-500">{formatDate(user.createdAt)}</DataTableCell>
            <DataTableCell>
              <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
            </DataTableCell>
          </DataTableRow>
        ))}
        {users.length === 0 && (
          <DataTableRow>
            <DataTableCell className="text-center py-8 text-zinc-500">No users found.</DataTableCell>
          </DataTableRow>
        )}
      </DataTable>
    </div>
  )
}
