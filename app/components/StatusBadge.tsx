import React from 'react'

// Statuses render as rubber stamps pressed onto the record. A signed
// resolution and a non-adopted one are the only stamps pressed in full ink.
const stampByStatus: Record<string, string> = {
  request_received: 'stamp--received',
  calendared: 'stamp--calendared',
  in_committee: 'stamp--committee',
  for_adoption: 'stamp--adoption',
  adopted: 'stamp--adopted',
  signed: 'stamp--signed',
  not_adopted: 'stamp--not-adopted',
  inactive: 'stamp--archived',
  // Ordinance statuses
  active: 'stamp--enacted',
}

const labelByStatus: Record<string, string> = {
  request_received: 'Request Received',
  calendared: 'On Calendar',
  in_committee: 'In Committee',
  for_adoption: 'For Adoption',
  adopted: 'Adopted',
  signed: 'Signed',
  not_adopted: 'Not Adopted',
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()
  const stamp = stampByStatus[key] ?? 'stamp--received'

  const label =
    labelByStatus[key] ??
    status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

  return <span className={`stamp ${stamp}`}>{label}</span>
}
