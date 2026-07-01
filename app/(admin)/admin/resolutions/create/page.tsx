import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { canManageResolutions } from '@/lib/utils/permissions'
import { ResolutionForm } from '@/app/components/ResolutionForm'

export default async function CreateResolutionPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canManageResolutions(session)) redirect('/admin/resolutions')

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return <ResolutionForm departments={departments} />
}
