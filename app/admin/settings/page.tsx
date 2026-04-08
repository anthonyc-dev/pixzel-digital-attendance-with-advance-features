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

  const [currentPassword, setCurrentPassword] = useState('');
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

    if (!accountEmail) {
      toast.error('No email found for this account.');
      return;
    }
    if (!currentPassword) {
      toast.error('Enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('New password must be different from your current password.');
      return;
    }

    setPasswordLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: accountEmail,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordLoading(false);
      toast.error('Current password is incorrect.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password updated.');
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
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
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
            Enter your current password, then choose a new one (at least 6 characters). If you
            forgot your password, use forgot password from the login page instead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
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
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
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
            <Button type="submit" disabled={emailLoading} className=" px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-secondary hover:opacity-90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all flex items-center  gap-1.5 sm:gap-2 w-fit cursor-pointer">
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
