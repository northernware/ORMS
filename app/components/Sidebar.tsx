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
    <div className="flex h-full w-64 flex-col glass-card rounded-none border-t-0 border-b-0 border-l-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-sky-600 dark:text-sky-400">
          <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <ScrollText className="h-5 w-5" />
          </div>
          <span>ORMS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' 
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
