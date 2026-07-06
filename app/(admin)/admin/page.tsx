import React from 'react'
import { StatsCard } from '@/app/components/StatsCard'
import { FileText, ScrollText, FolderOpen, Database } from 'lucide-react'
import { ReportingService } from '@/lib/services/reporting.service'
import { getSession } from '@/lib/session'
import { formatFileSize } from '@/lib/utils/format'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const totals = await ReportingService.getSummaryTotals()
  const ordinancesByYear = await ReportingService.getOrdinanceCountsByYear(new Date().getFullYear() - 4, new Date().getFullYear())

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Summary of all legislative documents in the system.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Ordinances"
          value={totals.ordinances.total}
          icon={FileText}
          description={`${totals.ordinances.active} active`}
          trend="up"
        />
        <StatsCard
          title="Total Resolutions"
          value={totals.resolutions.total}
          icon={ScrollText}
          description="Across all statuses"
        />
        <StatsCard
          title="Documents"
          value={totals.documents.total}
          icon={FolderOpen}
          description={`${totals.documents.latestVersions} latest versions`}
        />
        <StatsCard
          title="Storage Used"
          value={formatFileSize(totals.documents.totalStorageBytes)}
          icon={Database}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Ordinances (Last 5 Years)</h3>
          <div className="h-64 flex items-end gap-4">
            {ordinancesByYear.map((stat) => (
              <div key={stat.year} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                <div
                  className="w-full bg-sky-100 border-t-2 border-sky-600 relative group"
                  style={{ height: `${Math.max((stat.total / Math.max(...ordinancesByYear.map(s => s.total))) * 100, 4)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white font-mono text-xs py-1 px-2 rounded-[2px] transition-opacity">
                    {stat.total}
                  </div>
                </div>
                <span className="font-mono text-xs text-zinc-500">{stat.year}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Resolution Statuses</h3>
          <div className="space-y-4">
            {totals.resolutions.byStatus.map((stat) => (
              <div key={stat.status} className="flex items-center">
                <span className="w-32 text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                  {stat.status.replace('_', ' ')}
                </span>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 dark:bg-sky-400"
                    style={{ width: `${(stat.total / Math.max(...totals.resolutions.byStatus.map(s => s.total))) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {stat.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
