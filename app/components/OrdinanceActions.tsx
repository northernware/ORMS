'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/types'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface Props {
  ordinanceId: number
  status: string
  role: Role
}

// Staff record the Mayor's decision on the request — there is no hearing
// and no vote, and an approval means a MOA right away.
export function OrdinanceActions({ ordinanceId, status, role }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decidedAt, setDecidedAt] = useState('')
  const [remarks, setRemarks] = useState('')

  const canEncode = role === 'Administrator' || role === 'Department_Head'

  async function decide(decision: 'approved' | 'declined') {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ordinances/${ordinanceId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, decidedAt: decidedAt || null, remarks: remarks || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Action failed.')
        return
      }
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const showForm = status === 'request_received' && canEncode

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">Actions</h3>
      {showForm ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">
            Record the Mayor&apos;s decision <span className="text-zinc-400">(approval = MOA agad)</span>
          </p>
          <label className="block text-xs text-zinc-500">
            Date decided
            <input
              type="date"
              value={decidedAt}
              onChange={(e) => setDecidedAt(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm mt-1"
            />
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Remarks (optional)"
            rows={2}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm"
          />
          <button disabled={loading} onClick={() => decide('approved')} className="btn-primary w-full justify-center">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Mayor Approved — MOA
          </button>
          <button
            disabled={loading}
            onClick={() => decide('declined')}
            className="btn-secondary w-full justify-center text-red-600"
          >
            <XCircle className="h-4 w-4 mr-2" /> Declined (Final)
          </button>
          {loading && (
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Working…
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {status === 'request_received'
            ? 'Awaiting the Mayor’s decision — recorded by staff.'
            : 'No further action — this record is closed.'}
        </p>
      )}
    </div>
  )
}
