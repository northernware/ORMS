'use client'

import React from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { createOrdinance } from '@/app/actions/ordinance'
import { FormField } from '@/app/components/FormField'
import { ArrowLeft, Save } from 'lucide-react'

interface Props {
  departments: { id: number; name: string }[]
}

export function OrdinanceForm({ departments }: Props) {
  const [state, action, pending] = useActionState(createOrdinance, undefined)
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ordinances" className="btn-secondary px-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">New Ordinance</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Record a new legislative ordinance.</p>
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
            <FormField label="Ordinance Number" name="ordinanceNumber" placeholder="ORD-2026-001" required error={state?.errors?.ordinanceNumber} />
            <FormField label="Year" name="year" type="number" defaultValue={String(currentYear)} required error={state?.errors?.year} />
          </div>
          <FormField label="Title" name="title" placeholder="Title of the ordinance" required error={state?.errors?.title} />
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Department" name="departmentId" as="select" required error={state?.errors?.departmentId}>
              <option value="">Select a department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </FormField>
            <FormField label="Approval Authority" name="approvalAuthority" placeholder="Municipal Council" error={state?.errors?.approvalAuthority} />
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">5W1H Framework</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Who" name="who" placeholder="Responsible parties" error={state?.errors?.who} />
            <FormField label="When" name="when" type="date" error={state?.errors?.when} />
          </div>
          <FormField label="What" name="what" as="textarea" placeholder="What the ordinance covers" error={state?.errors?.what} />
          <FormField label="Where" name="where" placeholder="Coverage area" error={state?.errors?.where} />
          <FormField label="Why" name="why" as="textarea" placeholder="Rationale" error={state?.errors?.why} />
          <FormField label="How" name="how" as="textarea" placeholder="Means of implementation" error={state?.errors?.how} />
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Notes</h3>
          <FormField label="Summary" name="summary" as="textarea" placeholder="Executive summary" error={state?.errors?.summary} />
          <FormField label="Internal Notes" name="notes" as="textarea" placeholder="Optional internal notes" error={state?.errors?.notes} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/ordinances" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Create Ordinance</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
