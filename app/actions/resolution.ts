'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { resolutionCreateSchema } from '@/lib/validators/resolution.schema'
import { canManageResolutions } from '@/lib/utils/permissions'

export type ResolutionFormState = {
  errors?: Record<string, string[] | undefined>
  message?: string
} | undefined

// Blank form fields arrive as '' — normalize to null so optional/date fields validate.
function emptyToNull(value: FormDataEntryValue | null): string | null {
  const s = typeof value === 'string' ? value.trim() : ''
  return s === '' ? null : s
}

export async function createResolution(
  _state: ResolutionFormState,
  formData: FormData
): Promise<ResolutionFormState> {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!canManageResolutions(session)) {
    return { message: 'You do not have permission to create resolutions.' }
  }

  const parsed = resolutionCreateSchema.safeParse({
    resolutionNumber: formData.get('resolutionNumber'),
    title: formData.get('title'),
    year: formData.get('year'),
    term: emptyToNull(formData.get('term')),
    who: emptyToNull(formData.get('who')),
    what: emptyToNull(formData.get('what')),
    when: emptyToNull(formData.get('when')),
    where: emptyToNull(formData.get('where')),
    why: emptyToNull(formData.get('why')),
    how: emptyToNull(formData.get('how')),
    requestedBy: emptyToNull(formData.get('requestedBy')),
    requestReceivedAt: emptyToNull(formData.get('requestReceivedAt')),
    endorsedByMayor: formData.get('endorsedByMayor') === 'on',
    responsibleDepartmentId: formData.get('responsibleDepartmentId'),
    summary: emptyToNull(formData.get('summary')),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const headerList = await headers()

  let created
  try {
    created = await ResolutionService.create(
      // Every resolution starts life as a received request — the SB office
      // calendars it from there.
      { ...parsed.data, status: 'request_received', createdBy: session.id, updatedBy: session.id },
      headerList.get('x-forwarded-for') ?? undefined,
      headerList.get('user-agent') ?? undefined
    )
  } catch {
    return { message: 'Failed to create resolution.' }
  }

  redirect(`/admin/resolutions/${created.id}`)
}
