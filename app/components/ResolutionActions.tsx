'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/types'
import { CalendarPlus, Landmark, FileCheck2, Stamp, PenLine, XCircle, Loader2 } from 'lucide-react'

interface Props {
  resolutionId: number
  status: string
  role: Role
  committees: { id: number; name: string }[]
}

// All lifecycle actions are encoded by SB office staff (or an administrator).
// SB members, the Vice Mayor, and the Mayor view the register — the actual
// decisions happen on the session floor and are only recorded here.
export function ResolutionActions({ resolutionId, status, role, committees }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionDate, setSessionDate] = useState('')
  const [committeeId, setCommitteeId] = useState('')
  const [hearingHeldAt, setHearingHeldAt] = useState('')
  const [findings, setFindings] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [remarks, setRemarks] = useState('')
  const [signedAt, setSignedAt] = useState('')
  const [notifiedAt, setNotifiedAt] = useState('')

  const base = `/api/resolutions/${resolutionId}`
  const canEncode = role === 'Administrator' || role === 'SB_Staff'

  async function post(path: string, body: Record<string, unknown>) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const inputClass =
    'w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm'

  const actions: React.ReactNode[] = []

  if (status === 'request_received' && canEncode) {
    actions.push(
      <div key="calendar" className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">
          Place on the Calendar of Business
        </p>
        <label className="block text-xs text-zinc-500">
          Regular session date
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <button
          disabled={loading || !sessionDate}
          onClick={() => post('/calendar', { sessionDate })}
          className="btn-primary w-full justify-center"
        >
          <CalendarPlus className="h-4 w-4 mr-2" /> Calendar for Session
        </button>
      </div>
    )
  }

  if (status === 'calendared' && canEncode) {
    actions.push(
      <div key="refer" className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">
          Refer to standing committee <span className="text-zinc-400">(done in regular session)</span>
        </p>
        <select value={committeeId} onChange={(e) => setCommitteeId(e.target.value)} className={inputClass}>
          <option value="">Select committee…</option>
          {committees.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          disabled={loading || !committeeId}
          onClick={() => post('/refer', { committeeId: Number(committeeId) })}
          className="btn-primary w-full justify-center"
        >
          <Landmark className="h-4 w-4 mr-2" /> Record Referral
        </button>
      </div>
    )
  }

  if (status === 'in_committee' && canEncode) {
    actions.push(
      <div key="report" className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">Submit committee report</p>
        <label className="block text-xs text-zinc-500">
          Committee hearing date
          <input type="date" value={hearingHeldAt} onChange={(e) => setHearingHeldAt(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <textarea
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Findings (optional)"
          rows={3}
          className={inputClass}
        />
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="Recommendation (required)"
          rows={2}
          className={inputClass}
        />
        <label className="block text-xs text-zinc-500">
          Adoption session date (back on the Calendar of Business)
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <button
          disabled={loading || !recommendation || !sessionDate}
          onClick={() =>
            post('/committee-report', {
              findings: findings || null,
              recommendation,
              hearingHeldAt: hearingHeldAt || null,
              sessionDate,
            })
          }
          className="btn-primary w-full justify-center"
        >
          <FileCheck2 className="h-4 w-4 mr-2" /> Record Report — For Adoption
        </button>
      </div>
    )
  }

  if (status === 'for_adoption' && canEncode) {
    actions.push(
      <div key="adoption" className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">
          Record the session outcome <span className="text-zinc-400">(vote by the whole SB)</span>
        </p>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks (optional)"
          rows={2}
          className={inputClass}
        />
        <button
          disabled={loading}
          onClick={() => post('/adoption', { outcome: 'adopted', remarks: remarks || null })}
          className="btn-primary w-full justify-center"
        >
          <Stamp className="h-4 w-4 mr-2" /> Adopted by the SB
        </button>
        <button
          disabled={loading}
          onClick={() => post('/adoption', { outcome: 'not_adopted', remarks: remarks || null })}
          className="btn-secondary w-full justify-center text-red-600"
        >
          <XCircle className="h-4 w-4 mr-2" /> Not Adopted (Final)
        </button>
      </div>
    )
  }

  if (status === 'adopted' && canEncode) {
    actions.push(
      <div key="sign" className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">Record the Mayor&apos;s signature</p>
        <label className="block text-xs text-zinc-500">
          Date signed
          <input type="date" value={signedAt} onChange={(e) => setSignedAt(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-xs text-zinc-500">
          Requester notified on
          <input type="date" value={notifiedAt} onChange={(e) => setNotifiedAt(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <button
          disabled={loading}
          onClick={() =>
            post('/sign', { signedAt: signedAt || null, requesterNotifiedAt: notifiedAt || null })
          }
          className="btn-primary w-full justify-center"
        >
          <PenLine className="h-4 w-4 mr-2" /> Record Signature
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">Actions</h3>
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
        <p className="text-sm text-zinc-500">
          {canEncode
            ? 'No further action — this record is closed.'
            : 'View only — the SB office records all actions on this register.'}
        </p>
      )}
    </div>
  )
}
