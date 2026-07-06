import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const resolution = await ResolutionService.viceMayorApprove(
      Number(id),
      session,
      request.headers.get('x-forwarded-for') ?? undefined,
      request.headers.get('user-agent') ?? undefined
    )
    return NextResponse.json({ data: resolution, message: 'Approved by Vice Mayor. Forwarded to Mayor.' })
  } catch (e: any) {
    const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422 }
    return NextResponse.json({ error: e.message }, { status: statusMap[e.message] ?? 500 })
  }
}
