import React from 'react'
import { getSession } from '@/lib/session'
import { OrdinanceService } from '@/lib/services/ordinance.service'
import { StatusBadge } from '@/app/components/StatusBadge'
import { OrdinanceActions } from '@/app/components/OrdinanceActions'
import { OrdinanceSlip } from '@/app/components/RoutingSlip'
import { formatDate } from '@/lib/utils/format'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, User, Calendar, MapPin, HelpCircle, Briefcase, FileSignature, Clock, Inbox } from 'lucide-react'

export default async function ViewOrdinancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  if (!Number.isInteger(Number(id))) return <div className="text-center py-12">Ordinance not found</div>

  let ordinance;
  try {
    ordinance = await OrdinanceService.findById(Number(id), session)
  } catch (error) {
    return <div className="text-center py-12 text-red-500">Access Denied or Server Error</div>
  }

  if (!ordinance) return <div className="text-center py-12">Ordinance not found</div>

  const fiveW = OrdinanceService.getFiveWOneH(ordinance)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ordinances" className="btn-secondary px-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-semibold tracking-tight text-zinc-900">
              {ordinance.ordinanceNumber}
            </h2>
            <StatusBadge status={ordinance.status} />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">{ordinance.title}</p>
        </div>
        {ordinance.status === 'approved' && (
          <span className="stamp-lg text-emerald-800 ml-auto hidden sm:inline-block">MOA</span>
        )}
        {ordinance.status === 'declined' && (
          <span className="stamp-lg text-red-600 ml-auto hidden sm:inline-block">Declined</span>
        )}
      </div>

      <OrdinanceSlip status={ordinance.status} />

      {ordinance.remarks && ordinance.status === 'declined' && (
        <div className="glass-card p-4 border-l-4 border-l-red-500">
          <p className="text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
            Declined by the Mayor
          </p>
          <p className="text-sm text-zinc-700">{ordinance.remarks}</p>
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
                <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{ordinance.requestedBy || '—'}</dd>
              </div>
              <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-zinc-500">Received on</dt>
                <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">
                  {ordinance.requestReceivedAt ? formatDate(ordinance.requestReceivedAt) : '—'}
                </dd>
              </div>
              {ordinance.decidedAt && (
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-zinc-500">Mayor decided on</dt>
                  <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{formatDate(ordinance.decidedAt)}</dd>
                </div>
              )}
              {ordinance.remarks && ordinance.status !== 'declined' && (
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-zinc-500">Remarks</dt>
                  <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0">{ordinance.remarks}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-500" /> Executive Summary
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {ordinance.summary || 'No summary provided.'}
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" /> 5W1H Framework
              </h3>
            </div>
            <div className="p-0">
              <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><User className="h-4 w-4"/> Who</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{fiveW.who || '—'}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><FileText className="h-4 w-4"/> What</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{fiveW.what || '—'}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><Calendar className="h-4 w-4"/> When</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{fiveW.when || '—'}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><MapPin className="h-4 w-4"/> Where</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{fiveW.where || '—'}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><HelpCircle className="h-4 w-4"/> Why</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{fiveW.why || '—'}</dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2"><Briefcase className="h-4 w-4"/> How</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:col-span-2 sm:mt-0">{fiveW.how || '—'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OrdinanceActions ordinanceId={ordinance.id} status={ordinance.status} role={session.role} />

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4 uppercase tracking-wider">Metadata</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><FileSignature className="h-3 w-3"/> Department</p>
                <p className="text-sm font-medium">{ordinance.department.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><User className="h-3 w-3"/> Created By</p>
                <p className="text-sm font-medium">{(ordinance as any).creator.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Created At</p>
                <p className="text-sm font-medium">{formatDate(ordinance.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Last Updated</p>
                <p className="text-sm font-medium">{formatDate(ordinance.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
