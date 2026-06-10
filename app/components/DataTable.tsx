import React from 'react'

interface DataTableProps {
  columns: string[]
  children: React.ReactNode
}

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="table-container glass-card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {columns.map((col, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle font-medium text-zinc-500 dark:text-zinc-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function DataTableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${className}`}>{children}</tr>
}

export function DataTableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-4 align-middle ${className}`}>{children}</td>
}
