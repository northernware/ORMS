'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/types'
import { Send, Gavel, CheckCircle2, XCircle, Ban, Loader2 } from 'lucide-react'

interface Props {
  resolutionId: number
  status: string
  role: Role
  hearingsThisCycle: number
}

export function ResolutionActions({ resolutionId, status, role, hearingsThisCycle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hearing form state
  const [heldAt, setHeldAt] = useState('')
  const [minutes, setMinutes] = useState('')
  // Reason for send-back / veto
  const [reason, setReason] = useState('')

  const base = `/api/resolutions/${resolutionId}`

  const canRecordHearings = role === 'Administrator' || role === 'Department_Head'
  const canViceMayor = role === 'Vice_Mayor' || role === 'Administrator'
  const canMayor = role === 'Mayor' || role === 'Administrator'
  const canSubmit = role !== 'Staff'

  async function post(path: string, body?: Record<string, unknown>) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Action failed.')
        return
      }
      setReason('')
      setHeldAt('')
      setMinutes('')
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const actions: React.ReactNode[] = []

  if ((status === 'draft' || status === 'rejected') && canSubmit) {
    actions.push(
      <button key="submit" disabled={loading} onClick={() => post('/submit')} className="btn-primary w-full justify-center">
        <Send className="h-4 w-4 mr-2" /> Submit for Hearings
      </button>
    )
  }

  if (status === 'in_hearings' && canRecordHearings) {
    actions.push(
      <div key="hearing" className="space-y-3">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Record hearing <span className="text-sky-600">{hearingsThisCycle + 1} of 3</span>
        </p>
        <input
          type="date"
          value={heldAt}
          onChange={(e) => setHeldAt(e.target.value)}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
        />
        <textarea
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes / notes (optional)"
          rows={3}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          disabled={loading}
          onClick={() => post('/hearings', { heldAt: heldAt || null, minutes: minutes || null })}
          className="btn-primary w-full justify-center"
        >
          <Gavel className="h-4 w-4 mr-2" /> Record Hearing
        </button>
        {hearingsThisCycle === 2 && (
          <p className="text-xs text-amber-600">This is the final hearing — it will advance to the Vice Mayor.</p>
        )}
      </div>
    )
  }

  if (status === 'pending_vice_mayor' && canViceMayor) {
    actions.push(
      <div key="vm" className="space-y-3">
        <button disabled={loading} onClick={() => post('/vice-mayor/approve')} className="btn-primary w-full justify-center">
          <CheckCircle2 className="h-4 w-4 mr-2" /> Vice Mayor: Approve
        </button>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for sending back (optional)"
          rows={2}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          disabled={loading}
          onClick={() => post('/vice-mayor/reject', { reason: reason || null })}
          className="btn-secondary w-full justify-center text-red-600"
        >
          <XCircle className="h-4 w-4 mr-2" /> Send Back for Revision
        </button>
      </div>
    )
  }

  if (status === 'pending_mayor' && canMayor) {
    actions.push(
      <div key="mayor" className="space-y-3">
        <button disabled={loading} onClick={() => post('/mayor/approve')} className="btn-primary w-full justify-center">
          <CheckCircle2 className="h-4 w-4 mr-2" /> Mayor: Approve (Enact)
        </button>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for veto (optional)"
          rows={2}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          disabled={loading}
          onClick={() => post('/mayor/veto', { reason: reason || null })}
          className="btn-secondary w-full justify-center text-rose-600"
        >
          <Ban className="h-4 w-4 mr-2" /> Veto (Final)
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4 uppercase tracking-wider">Actions</h3>
      {actions.length > 0 ? (
        <div className="space-y-4">
          {actions}
          {loading && (
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Working…
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No actions available for your role at this stage.</p>
      )}
    </div>
  )
}
