import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { canManageOrdinances } from '@/lib/utils/permissions'
import { OrdinanceForm } from '@/app/components/OrdinanceForm'

export default async function CreateOrdinancePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canManageOrdinances(session)) redirect('/admin/ordinances')

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return <OrdinanceForm departments={departments} />
}
