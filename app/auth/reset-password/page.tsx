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

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      // When the user clicks the email link, Supabase may set a "recovery" session
      // based on the URL fragment/query. We just need to detect that a session exists.
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      setHasRecoverySession(Boolean(data.session));
      setChecking(false);
    })();

    return () => {
      isMounted = false;
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

    toast.success('Password updated.');
    setRedirectIn(5);
    setSuccess(true);
    setPassword('');
    setConfirm('');
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
            Opened from your email verification link. Once saved, you’ll be asked to sign in again.
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
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                This page must be opened from the password reset email so we can verify your one-time code/link.
              </p>
              <Button type="button" variant="secondary" onClick={() => router.push('/auth/login')}>
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

