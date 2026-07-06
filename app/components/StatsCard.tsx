import React from 'react'
import { LucideIcon } from 'lucide-react'

export function StatsCard({ title, value, icon: Icon, description, trend }: {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-zinc-500">{title}</h3>
        <Icon className="h-4 w-4 text-zinc-300" />
      </div>
      <div className="mt-3">
        <p className="font-mono text-3xl font-medium text-zinc-900 tabular-nums">{value}</p>
        {description && (
          <p className="mt-1.5 text-sm text-zinc-500 flex items-center">
            {trend === 'up' && <span className="text-emerald-500 mr-1">↑</span>}
            {trend === 'down' && <span className="text-red-500 mr-1">↓</span>}
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
