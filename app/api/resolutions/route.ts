import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { resolutionCreateSchema } from '@/lib/validators/resolution.schema'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const filters = {
    year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
    departmentId: searchParams.get('department_id') ? Number(searchParams.get('department_id')) : undefined,
    status: searchParams.get('status') as any,
    search: searchParams.get('search') ?? undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: Math.min(Number(searchParams.get('per_page') ?? 15), 100),
  }

  const result = await ResolutionService.list(filters, session)
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = resolutionCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    const resolution = await ResolutionService.create(
      { ...parsed.data, createdBy: session.id, updatedBy: session.id },
      request.headers.get('x-forwarded-for') ?? undefined,
      request.headers.get('user-agent') ?? undefined
    )
    return NextResponse.json({ data: resolution, message: 'Resolution created successfully.' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
