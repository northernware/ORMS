import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ReportingService } from '@/lib/services/reporting.service'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const totals = await ReportingService.getSummaryTotals()
    return NextResponse.json({ data: totals })
  } catch (error) {
    console.error('Summary report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
