import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { adoptionSchema } from '@/lib/validators/resolution.schema'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const parsed = adoptionSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    const resolution = await ResolutionService.recordAdoption(
      Number(id),
      parsed.data,
      session,
      request.headers.get('x-forwarded-for') ?? undefined,
      request.headers.get('user-agent') ?? undefined
    )
    const message =
      parsed.data.outcome === 'adopted'
        ? 'Adoption by the Sangguniang Bayan recorded.'
        : 'Non-adoption recorded.'
    return NextResponse.json({ data: resolution, message })
  } catch (e: any) {
    const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422 }
    return NextResponse.json({ error: e.message }, { status: statusMap[e.message] ?? 500 })
  }
}
