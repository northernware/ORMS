import React from 'react'

type StepState = 'done' | 'current' | 'halted' | 'pending'

interface Step {
  label: string
  state: StepState
  note: string
}

// The paper routing slip attached to a resolution as it moves through the
// Sangguniang Bayan: request intake → Calendar of Business → committee
// hearing → adoption by the whole SB → Mayor's signature.
function buildSteps(status: string, committeeName?: string | null): Step[] {
  const committeeNote = committeeName ?? 'Committee hearing'

  switch (status) {
    case 'request_received':
      return [
        { label: 'Request', state: 'current', note: 'Received by SB office' },
        { label: 'Calendar', state: 'pending', note: '—' },
        { label: 'Committee', state: 'pending', note: '—' },
        { label: 'Adoption', state: 'pending', note: '—' },
        { label: 'Mayor', state: 'pending', note: '—' },
      ]
    case 'calendared':
      return [
        { label: 'Request', state: 'done', note: 'Received' },
        { label: 'Calendar', state: 'current', note: 'On Calendar of Business' },
        { label: 'Committee', state: 'pending', note: '—' },
        { label: 'Adoption', state: 'pending', note: '—' },
        { label: 'Mayor', state: 'pending', note: '—' },
      ]
    case 'in_committee':
      return [
        { label: 'Request', state: 'done', note: 'Received' },
        { label: 'Calendar', state: 'done', note: 'Taken up in session' },
        { label: 'Committee', state: 'current', note: committeeNote },
        { label: 'Adoption', state: 'pending', note: '—' },
        { label: 'Mayor', state: 'pending', note: '—' },
      ]
    case 'for_adoption':
      return [
        { label: 'Request', state: 'done', note: 'Received' },
        { label: 'Calendar', state: 'done', note: 'Taken up in session' },
        { label: 'Committee', state: 'done', note: 'Report submitted' },
        { label: 'Adoption', state: 'current', note: 'On calendar for adoption' },
        { label: 'Mayor', state: 'pending', note: '—' },
      ]
    case 'adopted':
      return [
        { label: 'Request', state: 'done', note: 'Received' },
        { label: 'Calendar', state: 'done', note: 'Taken up in session' },
        { label: 'Committee', state: 'done', note: 'Report submitted' },
        { label: 'Adoption', state: 'done', note: 'Approved by the SB' },
        { label: 'Mayor', state: 'current', note: 'Awaiting signature' },
      ]
    case 'not_adopted':
      return [
        { label: 'Request', state: 'done', note: 'Received' },
        { label: 'Calendar', state: 'done', note: 'Taken up in session' },
        { label: 'Committee', state: 'done', note: 'Report submitted' },
        { label: 'Adoption', state: 'halted', note: 'Not adopted — final' },
        { label: 'Mayor', state: 'pending', note: '—' },
      ]
    case 'signed':
      return [
        { label: 'Request', state: 'done', note: 'Received' },
        { label: 'Calendar', state: 'done', note: 'Taken up in session' },
        { label: 'Committee', state: 'done', note: 'Report submitted' },
        { label: 'Adoption', state: 'done', note: 'Approved by the SB' },
        { label: 'Mayor', state: 'done', note: 'Signed — requester notified' },
      ]
    default:
      return []
  }
}

const noteColor: Record<StepState, string> = {
  done: 'text-emerald-800',
  current: 'text-amber-600',
  halted: 'text-red-600',
  pending: 'text-zinc-400',
}

// The ordinance slip is short: the request goes straight to the Mayor —
// no hearing, no vote — and an approval means a MOA right away.
function buildOrdinanceSteps(status: string): Step[] {
  switch (status) {
    case 'request_received':
      return [
        { label: 'Request', state: 'current', note: 'Filed — anyone may request' },
        { label: 'Mayor', state: 'pending', note: '—' },
        { label: 'MOA', state: 'pending', note: '—' },
      ]
    case 'approved':
      return [
        { label: 'Request', state: 'done', note: 'Filed' },
        { label: 'Mayor', state: 'done', note: 'Approved' },
        { label: 'MOA', state: 'done', note: 'Executed at once' },
      ]
    case 'declined':
      return [
        { label: 'Request', state: 'done', note: 'Filed' },
        { label: 'Mayor', state: 'halted', note: 'Declined — final' },
        { label: 'MOA', state: 'pending', note: '—' },
      ]
    default:
      return []
  }
}

export function OrdinanceSlip({ status }: { status: string }) {
  const steps = buildOrdinanceSteps(status)
  if (steps.length === 0) return null

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-2.5 border-b border-zinc-200">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
          Routing slip
        </span>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={`px-5 py-4 ${step.state === 'pending' ? 'opacity-55' : ''}`}
          >
            <span className="block font-mono text-[0.6rem] text-zinc-400 mb-1">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`block text-sm mb-0.5 ${
                step.state === 'current' ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'
              }`}
            >
              {step.label}
            </span>
            <span className={`block font-mono text-[0.65rem] tracking-wide ${noteColor[step.state]}`}>
              {step.state === 'done' && '✓ '}
              {step.note}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function RoutingSlip({
  status,
  committeeName,
}: {
  status: string
  committeeName?: string | null
}) {
  const steps = buildSteps(status, committeeName)
  if (steps.length === 0) return null

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-200">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
          Routing slip
        </span>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={`px-5 py-4 ${step.state === 'pending' ? 'opacity-55' : ''}`}
          >
            <span className="block font-mono text-[0.6rem] text-zinc-400 mb-1">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`block text-sm mb-0.5 ${
                step.state === 'current' ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'
              }`}
            >
              {step.label}
            </span>
            <span className={`block font-mono text-[0.65rem] tracking-wide ${noteColor[step.state]}`}>
              {step.state === 'done' && '✓ '}
              {step.note}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
