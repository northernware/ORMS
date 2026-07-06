'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { FormField } from '@/app/components/FormField'
import { ScrollText, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center ledger-lines">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 flex flex-col items-center">
          {/* The municipal seal, pressed at the head of the page. */}
          <div className="h-16 w-16 rounded-full border-2 border-zinc-900 flex items-center justify-center mb-4 bg-white">
            <div className="h-[52px] w-[52px] rounded-full border border-zinc-900/40 flex items-center justify-center">
              <ScrollText className="h-6 w-6 text-zinc-900" />
            </div>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500 mb-1">
            Ordinance &amp; Resolution Management
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">The Municipal Register</h1>
          <p className="text-zinc-500 mt-2 text-center">
            Sign in to file, route, and enact legislative records.
          </p>
        </div>

        <div className="glass-card p-8">
          <form action={action} className="space-y-6">
            {state?.message && (
              <div className="p-3 bg-red-100 text-red-800 border border-red-200 rounded-[2px] text-sm font-medium">
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
              className="btn-primary w-full"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-200 text-center">
            <p className="font-mono text-[0.65rem] leading-relaxed text-zinc-500">
              DEMO CREDENTIALS<br />
              admin@orms.gov / password<br />
              head@orms.gov / password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
