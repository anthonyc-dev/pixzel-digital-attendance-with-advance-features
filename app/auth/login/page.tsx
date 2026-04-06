'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ENV } from '@/lib/api'

const Login = () => {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showFinalLogo, setShowFinalLogo] = useState(false)
  const [isWarping, setIsWarping] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  interface Employer {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    image: string | null;
  }

  const [employers, setEmployers] = useState<Employer[]>([])

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        console.log('Fetching personnel for login bubbles...')
        const res = await fetch(`${ENV.API_URL}/registration`, { cache: 'no-store' })
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const data = await res.json()
          console.log('Personnel Data:', data)
          if (data && data.data && data.data.length > 0) {
            // Take top 6 registered personnel
            const filtered = data.data.slice(0, 6)
            setEmployers(filtered)
          }
        } else {
          console.error('API response is not JSON', await res.text())
        }
      } catch (err) {
        console.error('Failed to fetch personnel', err)
      }
    }
    fetchEmployers()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const typedIdentifier = identifier.trim()

    let emailToSignIn = typedIdentifier

    // Supabase Auth signs in with email/phone, so resolve username to email first.
    if (!typedIdentifier.includes('@')) {
      const resolveResponse = await fetch(`${ENV.API_URL}/auth/resolve-username`, {
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

    setIsSuccess(true)

    // Sequence the final animations
    setTimeout(() => setShowFinalLogo(true), 600)
    setTimeout(() => setIsWarping(true), 1700)
    setTimeout(() => setIsNavigating(true), 2400)

    setTimeout(() => {
      router.refresh()
      router.push('/admin/adminDashboard')
    }, 3000)
  }

  return (

    <main className="flex min-h-screen flex-col lg:flex-row bg-black overflow-hidden select-none relative">
      {/* Smooth Final Fade-to-Black Mask */}
      <div className={`fixed inset-0 bg-black z-[100] pointer-events-none transition-opacity duration-700 ${isNavigating ? 'opacity-100' : 'opacity-0'}`} />

      {/* Final Centered Warp Logo */}
      {showFinalLogo && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-[800ms] ease-in
          ${isWarping ? 'scale-[20] blur-3xl opacity-0' : 'scale-100 opacity-100 animate-in fade-in zoom-in-50 duration-500'}`}>
          <Image
            src="/logo/bizs.png"
            alt="Success Logo"
            width={200}
            height={80}
            className="object-contain drop-shadow-[0_0_50px_rgba(192,17,72,0.6)]"
          />
        </div>
      )}

      {/* Left Side: Red Brand Section */}
      <div className={`flex-1 bg-[#800B30] flex items-center justify-center p-12 lg:p-24 relative overflow-hidden transition-transform duration-[1500ms] ease-in-out ${isSuccess ? '-translate-x-full' : ''}`}>
        {/* Brand Background Image Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <Image
            src="/we are pixzel.jpg"
            alt="Pixzel Brand Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Subtle decorative background element */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black blur-[120px]" />
        </div>

        {/* Logo positioned top-left */}
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 animate-in fade-in slide-in-from-top-5 duration-1000">
          <Image
            src="/Pixzel-Digital-Logo-Light-Land.png"
            alt="Pixzel Digital Logo"
            width={160}
            height={46}
            className="object-contain"
            priority
          />
        </div>

        {/* Branding Text Section */}
        <div className="relative z-10 text-center space-y-10 max-w-lg px-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-tight font-outfit">
              Pixzel <span className="text-white/40">Digital</span>
            </h2>
            <p className="text-white/40 text-xs lg:text-sm font-medium tracking-widest max-w-[280px] mx-auto leading-relaxed uppercase">
              Next-Generation Attendance <br />Management System
            </p>
          </div>
        </div>

        {/* Registered Employers Avatar Bubble Stack (Bottom Left) */}
        {employers.length > 0 && (
          <div className="absolute bottom-2 left-2 z-20 flex items-end gap-3 animate-in fade-in slide-in-from-left-10 duration-1000 delay-700">
            <div className="flex -space-x-3 overflow-hidden">
              {employers.map((emp, i) => (
                <div
                  key={emp.id || i}
                  className="relative group transition-all duration-300 hover:scale-110 hover:-translate-y-2 cursor-pointer"
                  style={{ zIndex: i + 1 }}
                >
                  <div className="absolute -inset-1 bg-white/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-[#800B30] overflow-hidden bg-neutral-900 shadow-2xl flex items-center justify-center">
                    {emp.image ? (
                      <Image
                        src={emp.image}
                        alt={emp.employer_name}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#800B30]/30 text-white font-black text-sm uppercase">
                        {emp.employer_name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Black Login Section */}
      <div className={`flex-1 bg-[#050505] flex items-center justify-center p-8 lg:p-20 relative overflow-hidden transition-transform duration-[1500ms] ease-in-out ${isSuccess ? 'translate-x-full' : ''}`}>
        {/* Subtle decorative background element */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#800B30] blur-[120px]" />
        </div>

        <section className="w-full max-w-[340px] space-y-8 animate-in slide-in-from-right-20 duration-1000 ease-out relative z-10">
          <div className="space-y-6">
            {/* Bizs Logo */}
            <div className="flex justify-center">
              <Image
                src="/logo/bizs.png"
                alt="Bizs Logo"
                width={100}
                height={40}
                className="object-contain opacity-80"
              />
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">
                Welcome back
              </h1>
              <p className="text-neutral-500 text-sm font-medium">
                Sign in to manage your digital attendance records.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-medium" role="alert">
                  {error}
                </p>
              </div>
            ) : null}

            <div className="space-y-5">
              <div className="group relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-neutral-500 transition-colors group-focus-within:text-[#800B30]">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="email"
                  autoComplete="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-[#111111] border-none text-white px-12 py-3.5 rounded-xl text-sm outline-none ring-1 ring-neutral-800 transition-all focus:ring-2 focus:ring-[#800B30] placeholder:opacity-0"
                />
                <label
                  htmlFor="identifier"
                  className="absolute left-12 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium transition-all pointer-events-none
                    peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#C01148] peer-focus:bg-[#111111] peer-focus:px-1
                    peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111111] peer-[:not(:placeholder-shown)]:px-1"
                >
                  Email
                </label>
              </div>

              <div className="group relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-neutral-500 transition-colors group-focus-within:text-[#800B30]">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-[#111111] border-none text-white px-12 py-3.5 rounded-xl text-sm outline-none ring-1 ring-neutral-800 transition-all focus:ring-2 focus:ring-[#800B30] placeholder:opacity-0"
                />
                <label
                  htmlFor="password"
                  className="absolute left-12 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium transition-all pointer-events-none
                    peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#C01148] peer-focus:bg-[#111111] peer-focus:px-1
                    peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111111] peer-[:not(:placeholder-shown)]:px-1"
                >
                  Password
                </label>

                {/* Show/Hide Password Toggle */}
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-neutral-600 hover:text-white transition-colors animate-in fade-in zoom-in duration-200"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full py-3.5 rounded-xl bg-[#800B30] text-white font-bold text-base transition-all hover:bg-[#C01148] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
            <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-2 font-medium">
              <span className="hover:text-neutral-400 cursor-pointer transition-colors">Forgot Password?</span>
              <span className="hover:text-neutral-400 cursor-pointer transition-colors">Request Access</span>
            </div>
          </form>
        </section>

        {/* Subtle branding at bottom */}
        <div className="absolute bottom-8 text-[10px] text-neutral-700 font-mono tracking-widest uppercase">
          Created by intern students batch 2026
        </div>
      </div>
    </main>
  )
}

export default Login
