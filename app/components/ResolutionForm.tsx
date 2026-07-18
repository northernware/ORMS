'use client'

import React from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { createResolution } from '@/app/actions/resolution'
import { FormField } from '@/app/components/FormField'
import { ArrowLeft, Save } from 'lucide-react'

interface Props {
  departments: { id: number; name: string }[]
}

export function ResolutionForm({ departments }: Props) {
  const [state, action, pending] = useActionState(createResolution, undefined)
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/resolutions" className="btn-secondary px-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Receive Request</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Record a request for resolution. From here the SB office calendars it, the session refers it to committee, and the committee report returns for adoption.
          </p>
        </div>
      </div>

      <form action={action} className="space-y-6">
        {state?.message && (
          <div className="p-3 bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 rounded-md text-sm font-medium">
            {state.message}
          </div>
        )}

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Details</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Resolution Number" name="resolutionNumber" placeholder="RES-2026-001" required error={state?.errors?.resolutionNumber} />
            <FormField label="Year" name="year" type="number" defaultValue={String(currentYear)} required error={state?.errors?.year} />
          </div>
          <FormField label="Title" name="title" placeholder="Title of the resolution" required error={state?.errors?.title} />
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Responsible Department" name="responsibleDepartmentId" as="select" required error={state?.errors?.responsibleDepartmentId}>
              <option value="">Select a department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </FormField>
            <FormField label="Term" name="term" placeholder="2025-2028" error={state?.errors?.term} />
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Request</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Requested By" name="requestedBy" placeholder="Requesting office or body" error={state?.errors?.requestedBy} />
            <FormField label="Request Received On" name="requestReceivedAt" type="date" error={state?.errors?.requestReceivedAt} />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="endorsedByMayor" defaultChecked className="h-4 w-4 rounded border-zinc-300" />
            Endorsed by the Mayor&apos;s Office (with letter)
          </label>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">5W1H Framework</h3>
          <p className="text-xs text-zinc-500">Optional at intake — complete these as the record moves through committee.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Who" name="who" placeholder="Responsible parties" error={state?.errors?.who} />
            <FormField label="When" name="when" type="date" error={state?.errors?.when} />
          </div>
          <FormField label="What" name="what" as="textarea" placeholder="What the resolution covers" error={state?.errors?.what} />
          <FormField label="Where" name="where" placeholder="Coverage area" error={state?.errors?.where} />
          <FormField label="Why" name="why" as="textarea" placeholder="Rationale" error={state?.errors?.why} />
          <FormField label="How" name="how" as="textarea" placeholder="Means of implementation" error={state?.errors?.how} />
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Summary</h3>
          <FormField label="Executive Summary" name="summary" as="textarea" placeholder="Executive summary" error={state?.errors?.summary} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/resolutions" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Record Request</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
