import React from 'react'
import { getSession } from '@/lib/session'
import { CommitteeService } from '@/lib/services/committee.service'
import { redirect } from 'next/navigation'
import { Landmark } from 'lucide-react'

const positionLabel: Record<string, string> = {
  Chairman: 'Chairman',
  Vice_Chairman: 'Vice Chairman',
  Member: 'Member',
}

// The 11 standing committees of the Sangguniang Bayan, each with one
// chairman, one vice chairman, and three members.
export default async function CommitteesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const committees = await CommitteeService.list()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Standing Committees</h2>
        <p className="text-zinc-500">
          The {committees.length} committees of the Sanggunian and their composition.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {committees.map((committee) => (
          <div key={committee.id} className="glass-card overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-200">
              <div className="flex items-start gap-3">
                <Landmark className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 leading-snug">{committee.name}</h3>
                  {committee.description && (
                    <p className="text-xs text-zinc-500 mt-1">{committee.description}</p>
                  )}
                </div>
              </div>
            </div>
            <ul className="divide-y divide-zinc-100 flex-1">
              {committee.members.map((member) => (
                <li key={member.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-700">{member.name}</span>
                  <span
                    className={`font-mono text-[0.6rem] uppercase tracking-[0.12em] ${
                      member.position === 'Chairman'
                        ? 'text-zinc-900 font-semibold'
                        : member.position === 'Vice_Chairman'
                          ? 'text-zinc-600'
                          : 'text-zinc-400'
                    }`}
                  >
                    {positionLabel[member.position] ?? member.position}
                  </span>
                </li>
              ))}
            </ul>
            <div className="px-5 py-2.5 border-t border-zinc-200 bg-zinc-50/50">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-zinc-500">
                {committee._count.referrals} referral{committee._count.referrals === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
