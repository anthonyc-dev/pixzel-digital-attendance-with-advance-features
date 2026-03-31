import React from 'react'
import Image from 'next/image'

const Login = () => {
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

          <form className="space-y-5">
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
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="section-login username"
                  placeholder=" "
                  className="peer h-14 w-full rounded-xl border border-input bg-background/90 pb-2 pl-10 pr-3 pt-5 text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-ring/30 autofill:bg-background autofill:text-foreground"
                />
                <label
                  htmlFor="username"
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
                  autoComplete="section-login current-password"
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
              className="mt-2 h-11 w-full rounded-lg bg-secondary text-sm font-medium text-secondary-foreground transition hover:opacity-90"
            >
              Login
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Login