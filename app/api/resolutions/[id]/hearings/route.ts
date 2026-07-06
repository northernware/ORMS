import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { hearingCreateSchema } from '@/lib/validators/resolution.schema'

const statusMap: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  INVALID_STATUS: 422,
  HEARINGS_COMPLETE: 422,
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const hearings = await ResolutionService.listHearings(Number(id), session)
    return NextResponse.json({ data: hearings })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: statusMap[e.message] ?? 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = hearingCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    const result = await ResolutionService.recordHearing(
      Number(id),
      parsed.data,
      session,
      request.headers.get('x-forwarded-for') ?? undefined,
      request.headers.get('user-agent') ?? undefined
    )
    return NextResponse.json({ data: result, message: 'Hearing recorded.' }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: statusMap[e.message] ?? 500 })
  }
}
