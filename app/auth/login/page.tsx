'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const Login = () => {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const typedIdentifier = identifier.trim()

    let emailToSignIn = typedIdentifier

    // Supabase Auth signs in with email/phone, so resolve username to email first.
    if (!typedIdentifier.includes('@')) {
      const resolveResponse = await fetch('/api/auth/resolve-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: typedIdentifier,
        }),
      })

      if (!resolveResponse.ok) {
        setLoading(false)
        setError('Unable to verify username right now. Please try again.')
        return
      }

      const resolvePayload = (await resolveResponse.json()) as { email?: string; error?: string }

      if (!resolvePayload.email) {
        setLoading(false)
        setError(resolvePayload.error ?? 'Username not found.')
        return
      }

      emailToSignIn = resolvePayload.email
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToSignIn,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.refresh()
    router.push('/admin/adminDashboard')
  }

  return (
    <main className="dark min-h-screen bg-gradient-to-br from-background via-muted to-background p-6 md:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-lg items-center justify-center">
        <section className="w-full rounded-2xl border border-border bg-card/95 p-8 text-card-foreground shadow-xl backdrop-blur">
          <div className="mb-6 flex flex-col items-center gap-4 text-center">
            
            <div className="p-1">
              <Image
                src="/logo/bizs.png"
                alt="Bizsmart logo"
                width={500}
                height={133}
                priority
                className="h-32 w-auto object-contain md:h-36"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to your attendance dashboard.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground/80">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </span>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder=" "
                  className="peer h-14 w-full rounded-xl border border-input bg-background/90 pb-2 pl-10 pr-3 pt-5 text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-ring/30 autofill:bg-background autofill:text-foreground"
                />
                <label
                  htmlFor="identifier"
                  className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 px-1 text-sm text-muted-foreground transition-all duration-200 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-secondary peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:font-medium group-hover:top-2 group-hover:translate-y-0 group-hover:text-[11px]"
                >
                  Username
                </label>
              </div>
            </div>

            <div>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground/80">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer h-14 w-full rounded-xl border border-input bg-background/90 pb-2 pl-10 pr-3 pt-5 text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-ring/30 autofill:bg-background autofill:text-foreground"
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 px-1 text-sm text-muted-foreground transition-all duration-200 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-secondary peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:font-medium group-hover:top-2 group-hover:translate-y-0 group-hover:text-[11px]"
                >
                  Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-lg bg-secondary text-sm font-medium text-secondary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Login
