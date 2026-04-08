'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Enter a valid email address.')
      return
    }
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before requesting another reset email.`)
      return
    }

    setLoading(true)
    const verifyRes = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed }),
    })

    const verifyPayload = (await verifyRes.json()) as { error?: string }
    if (!verifyRes.ok) {
      setLoading(false)
      toast.error(verifyPayload.error ?? 'Email verification failed.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    try {
      sessionStorage.setItem('pd_password_reset_email', trimmed)
    } catch {
      /* ignore */
    }

    setCooldown(60)
    router.push('/auth/reset-password')
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 pb-10 pt-8 animate-in fade-in duration-500 ease-out">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-secondary" />
            <CardTitle>Forgot Password</CardTitle>
          </div>
          <CardDescription>
            Enter your registered email. We verify it exists, then email you a 6-digit code. On the next screen
            you will choose a new password and enter that code (your Supabase reset template must include{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{'{{ .Token }}'}</code>
            ).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <Button type="submit" disabled={loading || cooldown > 0} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading
                ? 'Sending...'
                : cooldown > 0
                  ? `Send reset email (${cooldown}s)`
                  : 'Send reset email'}
            </Button>
          </form>

          <Button type="button" variant="secondary" className="w-full" onClick={() => router.push('/auth/login')}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

