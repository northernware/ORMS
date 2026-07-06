import React from 'react'

// Statuses render as rubber stamps pressed onto the record. Each stage of
// the register has its own ink; a veto is the only stamp pressed in full.
const stampByStatus: Record<string, string> = {
  active: 'stamp--enacted',
  inactive: 'stamp--archived',
  draft: 'stamp--draft',
  in_hearings: 'stamp--hearings',
  pending_approval: 'stamp--vice-mayor',
  pending_vice_mayor: 'stamp--vice-mayor',
  pending_mayor: 'stamp--mayor',
  rejected: 'stamp--returned',
  vetoed: 'stamp--vetoed',
}

export function StatusBadge({ status }: { status: string }) {
  const stamp = stampByStatus[status.toLowerCase()] ?? 'stamp--draft'

  const label = status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return <span className={`stamp ${stamp}`}>{label}</span>
}
