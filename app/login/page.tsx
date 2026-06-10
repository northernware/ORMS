'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { FormField } from '@/app/components/FormField'
import { ScrollText, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="mb-8 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-sky-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-600/30">
            <ScrollText className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">ORMS Portal</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            Sign in to access the Ordinance and Resolution Management System.
          </p>
        </div>

        <div className="glass-card p-8">
          <form action={action} className="space-y-6">
            {state?.message && (
              <div className="p-3 bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 rounded-md text-sm font-medium">
                {state.message}
              </div>
            )}

            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="admin@orms.gov"
              required
              error={state?.errors?.email}
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              error={state?.errors?.password}
            />

            <button 
              type="submit" 
              disabled={pending}
              className="btn-primary w-full shadow-md shadow-sky-600/20"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in to Portal
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Demo Credentials:<br/>
              admin@orms.gov / password<br/>
              head@orms.gov / password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
