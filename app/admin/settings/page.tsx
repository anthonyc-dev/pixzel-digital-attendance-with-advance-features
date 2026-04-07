'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Palette, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getStoredPageBackground,
  PAGE_BACKGROUND_OPTIONS,
  setStoredPageBackground,
  type PageBackgroundId,
} from '@/lib/page-background';
export default function SettingsPage() {
  const supabase = createClient();

  const [pageBg, setPageBg] = useState<PageBackgroundId>('fire');
  const [accountEmail, setAccountEmail] = useState<string>('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    setPageBg(getStoredPageBackground());
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? '';
      setAccountEmail(email);
      setNewEmail(email);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  const handleBackgroundSave = (id: PageBackgroundId) => {
    setPageBg(id);
    setStoredPageBackground(id);
    toast.success('Page background updated');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Password updated');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (trimmed === accountEmail) {
      toast.info('That is already your current email.');
      return;
    }
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setEmailLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      'Check your inbox to confirm the new email address (if confirmation is enabled in your project).',
    );
  };

  return (
    <div className="w-full min-w-0 max-w-2xl space-y-6 pb-10 animate-in fade-in duration-500 ease-out">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Appearance and account security for this browser session.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-secondary" />
            <CardTitle>Page background</CardTitle>
          </div>
          <CardDescription>
            Applies to every page under Admin (dashboard, calendar, payroll,
            etc.) and to the home attendance kiosk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
            {PAGE_BACKGROUND_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleBackgroundSave(opt.id)}
                className={cn(
                  'min-w-0 rounded-xl border p-3 text-left transition hover:bg-muted/50 sm:p-4',
                  pageBg === opt.id
                    ? 'border-secondary ring-2 ring-inset ring-secondary/30 bg-secondary/5'
                    : 'border-border',
                )}
              >
                <div className="text-sm font-semibold text-foreground">
                  {opt.label}
                </div>
                <div className="mt-1 break-words text-xs text-muted-foreground">
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-secondary" />
            <CardTitle>Change password</CardTitle>
          </div>
          <CardDescription>
            Signed-in users can set a new password here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={passwordLoading} className="gap-2">
              {passwordLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-secondary" />
            <CardTitle>Change email</CardTitle>
          </div>
          <CardDescription className="break-words">
            Current:{' '}
            <span className="font-medium text-foreground break-all">
              {accountEmail || '—'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New email</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <Button type="submit" disabled={emailLoading} className="gap-2">
              {emailLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Update email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
