import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { decisionSchema } from '@/lib/validators/resolution.schema'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = decisionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    const resolution = await ResolutionService.viceMayorReject(
      Number(id),
      session,
      parsed.data.reason ?? undefined,
      request.headers.get('x-forwarded-for') ?? undefined,
      request.headers.get('user-agent') ?? undefined
    )
    return NextResponse.json({ data: resolution, message: 'Sent back for revision.' })
  } catch (e: any) {
    const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422 }
    return NextResponse.json({ error: e.message }, { status: statusMap[e.message] ?? 500 })
  }
}
