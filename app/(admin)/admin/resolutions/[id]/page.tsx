import React from 'react'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { StatusBadge } from '@/app/components/StatusBadge'
import { ResolutionActions } from '@/app/components/ResolutionActions'
import { formatDate } from '@/lib/utils/format'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, User, Calendar, MapPin, HelpCircle, Briefcase, FileSignature, Clock, Gavel } from 'lucide-react'

export default async function ViewResolutionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  if (!Number.isInteger(Number(id))) return <div className="text-center py-12">Resolution not found</div>

  let resolution
  let hearings
  try {
    resolution = await ResolutionService.findById(Number(id), session)
    hearings = await ResolutionService.listHearings(Number(id), session)
  } catch {
    return <div className="text-center py-12 text-red-500">Access Denied or Server Error</div>
  }

  if (!resolution) return <div className="text-center py-12">Resolution not found</div>

  const hearingsThisCycle = hearings.filter((h) => h.cycle === resolution!.hearingCycle).length
  const fiveW = [
    { label: 'Who', icon: User, value: resolution.who },
    { label: 'What', icon: FileText, value: resolution.what },
    { label: 'When', icon: Calendar, value: resolution.when ? formatDate(resolution.when) : null },
    { label: 'Where', icon: MapPin, value: resolution.where },
    { label: 'Why', icon: HelpCircle, value: resolution.why },
    { label: 'How', icon: Briefcase, value: resolution.how },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/resolutions" className="btn-secondary px-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {resolution.resolutionNumber}
            </h2>
            <StatusBadge status={resolution.status} />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">{resolution.title}</p>
        </div>
      </div>

      {resolution.feedback && (resolution.status === 'rejected' || resolution.status === 'vetoed') && (
        <div className="glass-card p-4 border-l-4 border-l-red-500">
          <p className="text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
            {resolution.status === 'vetoed' ? 'Veto reason' : 'Sent back for revision'}
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{resolution.feedback}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-500" /> Executive Summary
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {resolution.summary || 'No summary provided.'}
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" /> 5W1H Framework
              </h3>
            </div>
            <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {fiveW.map(({ label, icon: Icon, value }) => (
                <div key={label} className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Gavel className="h-5 w-5 text-amber-500" /> Hearings
              </h3>
            </div>
            {hearings.length === 0 ? (
              <p className="px-6 py-6 text-sm text-zinc-500">No hearings recorded yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {hearings.map((h) => (
                  <li key={h.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Hearing #{h.hearingNumber}
                        {h.cycle > 1 && <span className="text-xs text-zinc-400"> (cycle {h.cycle})</span>}
                      </p>
                      {h.minutes && <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{h.minutes}</p>}
                      <p className="text-xs text-zinc-400 mt-1">
                        Recorded by {(h as any).recorder?.name ?? 'Unknown'}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {h.heldAt ? formatDate(h.heldAt) : formatDate(h.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ResolutionActions
            resolutionId={resolution.id}
            status={resolution.status}
            role={session.role}
            hearingsThisCycle={hearingsThisCycle}
          />

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4 uppercase tracking-wider">Metadata</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><FileSignature className="h-3 w-3" /> Department</p>
                <p className="text-sm font-medium">{resolution.responsibleDepartment.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Approving Body</p>
                <p className="text-sm font-medium">{resolution.approvingBody || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Created By</p>
                <p className="text-sm font-medium">{(resolution as any).creator.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Created At</p>
                <p className="text-sm font-medium">{formatDate(resolution.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Last Updated</p>
                <p className="text-sm font-medium">{formatDate(resolution.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
