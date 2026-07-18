import React from 'react'
import { getSession } from '@/lib/session'
import { ResolutionService } from '@/lib/services/resolution.service'
import { CommitteeService } from '@/lib/services/committee.service'
import { StatusBadge } from '@/app/components/StatusBadge'
import { ResolutionActions } from '@/app/components/ResolutionActions'
import { RoutingSlip } from '@/app/components/RoutingSlip'
import { formatDate } from '@/lib/utils/format'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, User, Calendar, MapPin, HelpCircle, Briefcase,
  FileSignature, Clock, Landmark, Inbox, CalendarDays,
} from 'lucide-react'

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
  try {
    resolution = await ResolutionService.findById(Number(id), session)
  } catch {
    return <div className="text-center py-12 text-red-500">Access Denied or Server Error</div>
  }

  if (!resolution) return <div className="text-center py-12">Resolution not found</div>

  const committees = await CommitteeService.list()
  const referral = resolution.referrals[0] ?? null

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
            <h2 className="font-mono text-2xl font-semibold tracking-tight text-zinc-900">
              {resolution.resolutionNumber}
            </h2>
            <StatusBadge status={resolution.status} />
          </div>
          <p className="text-zinc-500">{resolution.title}</p>
        </div>
        {resolution.status === 'signed' && (
          <span className="stamp-lg text-emerald-800 ml-auto hidden sm:inline-block">Signed</span>
        )}
        {resolution.status === 'not_adopted' && (
          <span className="stamp-lg text-red-600 ml-auto hidden sm:inline-block">Not Adopted</span>
        )}
      </div>

      <RoutingSlip status={resolution.status} committeeName={referral?.committee?.name ?? null} />

      {resolution.remarks && resolution.status === 'not_adopted' && (
        <div className="glass-card p-4 border-l-4 border-l-red-500">
          <p className="text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
            Not adopted by the Sanggunian
          </p>
          <p className="text-sm text-zinc-700">{resolution.remarks}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Inbox className="h-5 w-5 text-amber-500" /> Request
              </h3>
            </div>
            <dl className="divide-y divide-zinc-200">
              <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-zinc-500">Requested by</dt>
                <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{resolution.requestedBy || '—'}</dd>
              </div>
              <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-zinc-500">Received on</dt>
                <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                  {resolution.requestReceivedAt ? formatDate(resolution.requestReceivedAt) : '—'}
                </dd>
              </div>
              <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-zinc-500">Endorsement</dt>
                <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                  {resolution.endorsedByMayor ? "Endorsed by the Mayor's Office (with letter)" : 'Direct request'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-500" /> Executive Summary
            </h3>
            <p className="text-zinc-700 leading-relaxed">
              {resolution.summary || 'No summary provided.'}
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Landmark className="h-5 w-5 text-indigo-500" /> Committee Action
              </h3>
            </div>
            {!referral ? (
              <p className="px-6 py-6 text-sm text-zinc-500">Not yet referred to a committee.</p>
            ) : (
              <dl className="divide-y divide-zinc-200">
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-zinc-500">Committee</dt>
                  <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{referral.committee.name}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-zinc-500">Referred on</dt>
                  <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{formatDate(referral.referredAt)}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-zinc-500">Hearing held</dt>
                  <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                    {referral.hearingHeldAt ? formatDate(referral.hearingHeldAt) : 'Pending'}
                  </dd>
                </div>
                {referral.reportSubmittedAt && (
                  <>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-zinc-500">Findings</dt>
                      <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                        {referral.reportFindings || '—'}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-zinc-500">Recommendation</dt>
                      <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                        {referral.reportRecommendation}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-zinc-500">Report submitted</dt>
                      <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                        {formatDate(referral.reportSubmittedAt)}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            )}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-amber-500" /> Calendar of Business
              </h3>
            </div>
            {resolution.calendarItems.length === 0 ? (
              <p className="px-6 py-6 text-sm text-zinc-500">Not yet calendared.</p>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {resolution.calendarItems.map((item) => (
                  <li key={item.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {item.purpose === 'referral' ? 'First take-up — referral to committee' : 'Committee report — for adoption'}
                      </p>
                      {item.remarks && <p className="text-sm text-zinc-600 mt-1">{item.remarks}</p>}
                    </div>
                    <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">
                      {formatDate(item.sessionDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" /> 5W1H Framework
              </h3>
            </div>
            <dl className="divide-y divide-zinc-200">
              {fiveW.map(({ label, icon: Icon, value }) => (
                <div key={label} className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</dt>
                  <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <ResolutionActions
            resolutionId={resolution.id}
            status={resolution.status}
            role={session.role}
            committees={committees.map((c) => ({ id: c.id, name: c.name }))}
          />

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">Metadata</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><FileSignature className="h-3 w-3" /> Responsible Department</p>
                <p className="text-sm font-medium">{resolution.responsibleDepartment.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Term</p>
                <p className="text-sm font-medium">{resolution.term || '—'}</p>
              </div>
              {resolution.adoptedAt && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Adopted</p>
                  <p className="text-sm font-medium">{formatDate(resolution.adoptedAt)}</p>
                </div>
              )}
              {resolution.signedAt && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Signed by the Mayor</p>
                  <p className="text-sm font-medium">{formatDate(resolution.signedAt)}</p>
                </div>
              )}
              {resolution.requesterNotifiedAt && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Requester notified</p>
                  <p className="text-sm font-medium">{formatDate(resolution.requesterNotifiedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Encoded By</p>
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
