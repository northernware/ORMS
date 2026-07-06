import React from 'react'
import { Sidebar } from '@/app/components/Sidebar'
import { getSession } from '@/lib/session'
import { logout } from '@/app/actions/auth'
import { LogOut, User as UserIcon } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 z-10">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
            Ordinance &amp; Resolution Management
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-[2px] border border-zinc-200 bg-white">
              <div className="h-6 w-6 rounded-full border border-zinc-300 flex items-center justify-center">
                <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <span className="text-sm font-medium text-zinc-700">
                {session?.name}
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-zinc-200 bg-zinc-50 text-zinc-500">
                {session?.role.replace('_', ' ')}
              </span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-[2px] transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
