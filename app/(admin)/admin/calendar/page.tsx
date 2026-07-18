import React from 'react'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { StatusBadge } from '@/app/components/StatusBadge'
import { formatDate } from '@/lib/utils/format'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Eye } from 'lucide-react'

// The Calendar of Business: the running agenda of the regular sessions —
// what the Sanggunian is going to tackle, session by session.
export default async function CalendarPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const items = await ResolutionService.listCalendar()

  const bySession = new Map<string, typeof items>()
  for (const item of items) {
    const key = item.sessionDate.toISOString().slice(0, 10)
    const group = bySession.get(key) ?? []
    group.push(item)
    bySession.set(key, group)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Calendar of Business</h2>
        <p className="text-zinc-500">
          Matters for the regular sessions — first take-up referrals and committee reports for adoption.
        </p>
      </div>

      {bySession.size === 0 && (
        <div className="glass-card p-10 text-center text-sm text-zinc-500">
          Nothing on the calendar yet.
        </div>
      )}

      {[...bySession.entries()].map(([dateKey, group]) => (
        <div key={dateKey} className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-200 bg-zinc-50/50">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-600">
              Regular session — {formatDate(group[0].sessionDate)}
            </span>
          </div>
          <ul className="divide-y divide-zinc-200">
            {group.map((item) => (
              <li key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[0.8rem] font-medium text-zinc-900">
                      {item.resolution.resolutionNumber}
                    </span>
                    <span className={`stamp ${item.purpose === 'adoption' ? 'stamp--adoption' : 'stamp--calendared'}`}>
                      {item.purpose === 'adoption' ? 'For Adoption' : 'For Referral'}
                    </span>
                    <StatusBadge status={item.resolution.status} />
                  </div>
                  <p className="text-sm text-zinc-700 truncate mt-1">{item.resolution.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {item.purpose === 'adoption' && item.resolution.referrals[0]
                      ? `Report of the ${item.resolution.referrals[0].committee.name}`
                      : `Requested by ${item.resolution.requestedBy ?? item.resolution.responsibleDepartment.name}`}
                    {item.remarks ? ` — ${item.remarks}` : ''}
                  </p>
                </div>
                <Link
                  href={`/admin/resolutions/${item.resolution.id}`}
                  className="p-1 text-zinc-400 hover:text-sky-600 transition-colors flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
