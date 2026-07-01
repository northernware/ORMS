'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { OrdinanceService } from '@/lib/services/ordinance.service'
import { ordinanceCreateSchema } from '@/lib/validators/ordinance.schema'
import { canManageOrdinances } from '@/lib/utils/permissions'

export type OrdinanceFormState = {
  errors?: Record<string, string[] | undefined>
  message?: string
} | undefined

// Blank form fields arrive as '' — normalize to null so optional/date fields validate.
function emptyToNull(value: FormDataEntryValue | null): string | null {
  const s = typeof value === 'string' ? value.trim() : ''
  return s === '' ? null : s
}

export async function createOrdinance(
  _state: OrdinanceFormState,
  formData: FormData
): Promise<OrdinanceFormState> {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canManageOrdinances(session)) {
    return { message: 'You do not have permission to create ordinances.' }
  }

  const parsed = ordinanceCreateSchema.safeParse({
    ordinanceNumber: formData.get('ordinanceNumber'),
    title: formData.get('title'),
    year: formData.get('year'),
    who: emptyToNull(formData.get('who')),
    what: emptyToNull(formData.get('what')),
    when: emptyToNull(formData.get('when')),
    where: emptyToNull(formData.get('where')),
    why: emptyToNull(formData.get('why')),
    how: emptyToNull(formData.get('how')),
    approvalAuthority: emptyToNull(formData.get('approvalAuthority')),
    departmentId: formData.get('departmentId'),
    summary: emptyToNull(formData.get('summary')),
    notes: emptyToNull(formData.get('notes')),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const headerList = await headers()

  let created
  try {
    created = await OrdinanceService.create(
      { ...parsed.data, createdBy: session.id, updatedBy: session.id },
      headerList.get('x-forwarded-for') ?? undefined,
      headerList.get('user-agent') ?? undefined
    )
  } catch {
    return { message: 'Failed to create ordinance. The ordinance number may already exist.' }
  }

  redirect(`/admin/ordinances/${created.id}`)
}
