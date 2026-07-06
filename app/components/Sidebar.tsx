'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ScrollText,
  FolderOpen,
  Building2,
  Users,
  History
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Ordinances', href: '/admin/ordinances', icon: FileText },
  { name: 'Resolutions', href: '/admin/resolutions', icon: ScrollText },
  { name: 'Documents', href: '/admin/documents', icon: FolderOpen },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-zinc-200">
      <div className="flex h-16 items-center gap-3 px-5 border-b border-zinc-200">
        {/* The seal: a double-ring mark, the way a municipal seal is pressed on paper. */}
        <div className="h-9 w-9 rounded-full border-[1.5px] border-zinc-900 flex items-center justify-center flex-shrink-0">
          <div className="h-7 w-7 rounded-full border border-zinc-900/40 flex items-center justify-center">
            <ScrollText className="h-3.5 w-3.5 text-zinc-900" />
          </div>
        </div>
        <div className="leading-tight">
          <span className="block font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-900">
            ORMS
          </span>
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-zinc-500">
            Municipal Register
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3">
        <p className="px-3 mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-zinc-400">
          Register
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 border-l-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-100 font-medium text-zinc-900'
                    : 'border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
