import React from 'react'

type StepState = 'done' | 'current' | 'halted' | 'pending'

interface Step {
  label: string
  state: StepState
  note: string
}

// The paper routing slip attached to a resolution as it moves between
// offices. Each box is one desk; the slip shows where the record sits.
function buildSteps(status: string, hearingsHeld: number): Step[] {
  const readingsNote = `${Math.min(hearingsHeld, 3)} of 3 held`

  switch (status) {
    case 'draft':
      return [
        { label: 'Filed', state: 'current', note: 'In preparation' },
        { label: 'Readings', state: 'pending', note: '—' },
        { label: 'Vice Mayor', state: 'pending', note: '—' },
        { label: 'Mayor', state: 'pending', note: '—' },
        { label: 'Enactment', state: 'pending', note: '—' },
      ]
    case 'in_hearings':
      return [
        { label: 'Filed', state: 'done', note: 'Submitted' },
        { label: 'Readings', state: 'current', note: readingsNote },
        { label: 'Vice Mayor', state: 'pending', note: '—' },
        { label: 'Mayor', state: 'pending', note: '—' },
        { label: 'Enactment', state: 'pending', note: '—' },
      ]
    case 'pending_vice_mayor':
      return [
        { label: 'Filed', state: 'done', note: 'Submitted' },
        { label: 'Readings', state: 'done', note: '3 of 3 held' },
        { label: 'Vice Mayor', state: 'current', note: 'Awaiting action' },
        { label: 'Mayor', state: 'pending', note: '—' },
        { label: 'Enactment', state: 'pending', note: '—' },
      ]
    case 'pending_mayor':
      return [
        { label: 'Filed', state: 'done', note: 'Submitted' },
        { label: 'Readings', state: 'done', note: '3 of 3 held' },
        { label: 'Vice Mayor', state: 'done', note: 'Approved' },
        { label: 'Mayor', state: 'current', note: 'Awaiting action' },
        { label: 'Enactment', state: 'pending', note: '—' },
      ]
    case 'active':
      return [
        { label: 'Filed', state: 'done', note: 'Submitted' },
        { label: 'Readings', state: 'done', note: '3 of 3 held' },
        { label: 'Vice Mayor', state: 'done', note: 'Approved' },
        { label: 'Mayor', state: 'done', note: 'Approved' },
        { label: 'Enactment', state: 'done', note: 'In effect' },
      ]
    case 'rejected':
      return [
        { label: 'Filed', state: 'done', note: 'Submitted' },
        { label: 'Readings', state: 'done', note: '3 of 3 held' },
        { label: 'Vice Mayor', state: 'halted', note: 'Returned for revision' },
        { label: 'Mayor', state: 'pending', note: '—' },
        { label: 'Enactment', state: 'pending', note: '—' },
      ]
    case 'vetoed':
      return [
        { label: 'Filed', state: 'done', note: 'Submitted' },
        { label: 'Readings', state: 'done', note: '3 of 3 held' },
        { label: 'Vice Mayor', state: 'done', note: 'Approved' },
        { label: 'Mayor', state: 'halted', note: 'Vetoed — final' },
        { label: 'Enactment', state: 'pending', note: '—' },
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

export function RoutingSlip({
  status,
  hearingsHeld,
  cycle,
}: {
  status: string
  hearingsHeld: number
  cycle: number
}) {
  const steps = buildSteps(status, hearingsHeld)
  if (steps.length === 0) return null

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-200">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
          Routing slip
        </span>
        {cycle > 1 && (
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-amber-600">
            Cycle {cycle} — resubmitted
          </span>
        )}
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
