import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { canManageUsers } from '@/lib/utils/permissions'
import { DataTable, DataTableRow, DataTableCell } from '@/app/components/DataTable'
import { StatusBadge } from '@/app/components/StatusBadge'

export default async function DepartmentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canManageUsers(session)) redirect('/admin')

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { users: true, ordinances: true, resolutions: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Departments</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Organizational units that own ordinances and resolutions.</p>
      </div>

      <DataTable columns={['Code', 'Name', 'Description', 'Users', 'Ordinances', 'Resolutions', 'Status']}>
        {departments.map((dept) => (
          <DataTableRow key={dept.id}>
            <DataTableCell className="font-medium">{dept.code}</DataTableCell>
            <DataTableCell>{dept.name}</DataTableCell>
            <DataTableCell>
              <div className="max-w-[280px] truncate text-zinc-500" title={dept.description ?? ''}>
                {dept.description || '—'}
              </div>
            </DataTableCell>
            <DataTableCell>{dept._count.users}</DataTableCell>
            <DataTableCell>{dept._count.ordinances}</DataTableCell>
            <DataTableCell>{dept._count.resolutions}</DataTableCell>
            <DataTableCell>
              <StatusBadge status={dept.isActive ? 'active' : 'inactive'} />
            </DataTableCell>
          </DataTableRow>
        ))}
        {departments.length === 0 && (
          <DataTableRow>
            <DataTableCell className="text-center py-8 text-zinc-500">No departments found.</DataTableCell>
          </DataTableRow>
        )}
      </DataTable>
    </div>
  )
}
