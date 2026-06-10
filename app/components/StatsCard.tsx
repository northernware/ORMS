import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
        <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
        {description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 flex items-center">
            {trend === 'up' && <span className="text-emerald-500 mr-1">↑</span>}
            {trend === 'down' && <span className="text-red-500 mr-1">↓</span>}
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
