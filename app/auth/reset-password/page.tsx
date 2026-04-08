'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

/** Email used for code-based reset; set from forgot-password or after “Send code” on this page. */
const RESET_EMAIL_STORAGE_KEY = 'pd_password_reset_email';

/** Per-tab: only true after email recovery link or PASSWORD_RECOVERY — not a normal login session. */
const RECOVERY_SESSION_STORAGE_KEY = 'pd_password_recovery_flow';

const RECOVERY_OTP_LENGTH = 6;

function markPasswordRecoveryFlow() {
  try {
    sessionStorage.setItem(RECOVERY_SESSION_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

function hasMarkedPasswordRecoveryFlow(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_SESSION_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function clearPasswordRecoveryFlow() {
  try {
    sessionStorage.removeItem(RECOVERY_SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function isRecoveryFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    const fromHash = new URLSearchParams(hash).get('type');
    if (fromHash === 'recovery') return true;
  }
  const search = window.location.search.replace(/^\?/, '');
  if (search) {
    const fromQuery = new URLSearchParams(search).get('type');
    if (fromQuery === 'recovery') return true;
  }
  return false;
}

/** Recovery sessions include `amr` with method `recovery` (works after the URL hash is consumed). */
function accessTokenIndicatesPasswordRecovery(accessToken: string): boolean {
  try {
    const base64Url = accessToken.split('.')[1];
    if (!base64Url) return false;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as {
      amr?: Array<{ method?: string } | string>;
    };
    const { amr } = payload;
    if (!Array.isArray(amr)) return false;
    return amr.some(
      (entry) =>
        entry === 'recovery' ||
        (typeof entry === 'object' && entry !== null && entry.method === 'recovery'),
    );
  } catch {
    return false;
  }
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  /** Code + new-password flow (no magic link): password step → OTP step. */
  const [codeFlowPhase, setCodeFlowPhase] = useState<null | 'password' | 'otp'>(null);
  const [otpValue, setOtpValue] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (isRecoveryFromUrl()) {
      markPasswordRecoveryFlow();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        markPasswordRecoveryFlow();
        if (isMounted) setHasRecoverySession(Boolean(session));
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      const token = data.session?.access_token;
      const recoveryFlow =
        hasMarkedPasswordRecoveryFlow() ||
        isRecoveryFromUrl() ||
        Boolean(token && accessTokenIndicatesPasswordRecovery(token));
      const hasRecovery = Boolean(data.session) && recoveryFlow;
      setHasRecoverySession(hasRecovery);

      if (!hasRecovery) {
        try {
          const stored = sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY);
          if (stored) {
            setEmail(stored);
            setCodeFlowPhase('password');
          }
        } catch {
          /* ignore */
        }
      }

      setChecking(false);
    })();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!success || redirectIn === null) return;
    if (redirectIn <= 0) {
      router.push('/auth/login');
      router.refresh();
      return;
    }
    const t = window.setTimeout(() => setRedirectIn((v) => (v === null ? null : v - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [redirectIn, router, success]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    clearPasswordRecoveryFlow();
    toast.success('Password updated.');
    setRedirectIn(5);
    setSuccess(true);
    setPassword('');
    setConfirm('');
    await supabase.auth.signOut();
  };

  const verifyEmailAllowedForReset = async (addr: string): Promise<string | null> => {
    const res = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addr }),
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) return payload.error ?? 'Email verification failed.';
    return null;
  };

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown}s before resending.`);
      return;
    }

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Enter a valid email address.');
      return;
    }

    setResending(true);
    const checkErr = await verifyEmailAllowedForReset(trimmed);
    if (checkErr) {
      setResending(false);
      toast.error(checkErr);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    try {
      sessionStorage.setItem(RESET_EMAIL_STORAGE_KEY, trimmed);
    } catch {
      /* ignore */
    }
    setCodeFlowPhase('password');
    setPassword('');
    setConfirm('');
    setOtpValue('');
    setResendCooldown(60);
    toast.success(
      'Code sent. Enter your new password below, then you will confirm the 6-digit code from the email.',
    );
  };

  const onStartCodeFlowWithEmail = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Enter the email you used (or will use) for this reset.');
      return;
    }
    try {
      sessionStorage.setItem(RESET_EMAIL_STORAGE_KEY, trimmed);
    } catch {
      /* ignore */
    }
    setCodeFlowPhase('password');
    setPassword('');
    setConfirm('');
    setOtpValue('');
  };

  const onBackFromPasswordStep = () => {
    setCodeFlowPhase(null);
    setPassword('');
    setConfirm('');
    setOtpValue('');
    try {
      sessionStorage.removeItem(RESET_EMAIL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const onContinueToOtpStep = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setOtpValue('');
    setCodeFlowPhase('otp');
  };

  const onBackFromOtpStep = () => {
    setCodeFlowPhase('password');
    setOtpValue('');
  };

  const onSubmitOtpAndPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    const token = otpValue.replace(/\s/g, '');
    if (token.length !== RECOVERY_OTP_LENGTH) {
      toast.error(`Enter the ${RECOVERY_OTP_LENGTH}-digit code from your email.`);
      return;
    }
    if (password.length < 6 || password !== confirm) {
      toast.error('Password fields are invalid. Go back and check them.');
      return;
    }

    setSaving(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: trimmed,
      token,
      type: 'recovery',
    });
    if (otpError) {
      setSaving(false);
      toast.error(otpError.message);
      return;
    }

    markPasswordRecoveryFlow();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    clearPasswordRecoveryFlow();
    try {
      sessionStorage.removeItem(RESET_EMAIL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setCodeFlowPhase(null);
    toast.success('Password updated.');
    setRedirectIn(5);
    setSuccess(true);
    setPassword('');
    setConfirm('');
    setOtpValue('');
    await supabase.auth.signOut();
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 pb-10 pt-8 animate-in fade-in duration-500 ease-out">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-secondary" />
            <CardTitle>Set a new password</CardTitle>
          </div>
          <CardDescription>
            {hasRecoverySession
              ? 'Opened from your email link. After you save, you will sign in again.'
              : codeFlowPhase === 'password'
                ? 'Step 1 of 2: set a new password. Next you will enter the 6-digit code from your email.'
                : codeFlowPhase === 'otp'
                  ? 'Step 2 of 2: enter the code from your email to confirm and save your new password.'
                  : 'Get a code by email, use the link in that email, or continue here with email + code (template must include the token — see forgot password page).'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking recovery session…
            </div>
          ) : success ? (
            <div className="space-y-3 text-sm">
              <p className="text-foreground font-medium">Password updated successfully.</p>
              <p className="text-muted-foreground">
                Redirecting to login{redirectIn !== null ? ` in ${redirectIn}s` : ''}…
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  router.push('/auth/login');
                  router.refresh();
                }}
              >
                Go to login now
              </Button>
            </div>
          ) : hasRecoverySession ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save new password
              </Button>
            </form>
          ) : codeFlowPhase === 'password' ? (
            <form onSubmit={onContinueToOtpStep} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onBackFromPasswordStep}>
                  Back
                </Button>
                <Button type="submit" className="sm:min-w-40">
                  Continue to code
                </Button>
              </div>
            </form>
          ) : codeFlowPhase === 'otp' ? (
            <form onSubmit={onSubmitOtpAndPassword} className="space-y-4">
              <p className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Code sent to{' '}
                <span className="font-medium text-foreground break-all">{email || '—'}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="recovery-otp">Code from email</Label>
                <InputOTP
                  id="recovery-otp"
                  maxLength={RECOVERY_OTP_LENGTH}
                  value={otpValue}
                  onChange={setOtpValue}
                  containerClassName="justify-center sm:justify-start"
                >
                  <InputOTPGroup>
                    {Array.from({ length: RECOVERY_OTP_LENGTH }, (_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onBackFromOtpStep}>
                  Back
                </Button>
                <Button type="submit" disabled={saving} className="gap-2 sm:min-w-40">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify and save password
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Send a 6-digit code to your email, or open the reset link from that message. To use the code only:
                enter your email, send the code, then set your new password and confirm the digits.
              </p>
              <form onSubmit={onResend} className="space-y-3 rounded-xl border border-border p-3">
                <div className="space-y-2">
                  <Label htmlFor="resend-email">Email</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={resending || resendCooldown > 0}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {resending
                    ? 'Sending...'
                    : resendCooldown > 0
                      ? `Send code (${resendCooldown}s)`
                      : 'Send 6-digit code'}
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onStartCodeFlowWithEmail}
              >
                I already have a code — enter new password
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => router.push('/auth/login')}>
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

