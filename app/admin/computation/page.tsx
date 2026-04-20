 'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

export default function ComputationPage() {
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [lateGraceMinutes, setLateGraceMinutes] = useState('5');
  const [standardWorkMinutes, setStandardWorkMinutes] = useState('480');
  const [breakAllowedMinutes, setBreakAllowedMinutes] = useState('60');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState('1.25');

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/deduction-settings', { cache: 'no-store' });
        if (response.ok) {
          const settings = await response.json();
          setLateGraceMinutes(String(settings.late_grace_minutes ?? 5));
          setStandardWorkMinutes(String(settings.standard_work_minutes ?? 480));
          setBreakAllowedMinutes(String(settings.break_allowed_minutes ?? 60));
          setOvertimeMultiplier(String(settings.overtime_multiplier ?? 1.25));
        }
      } catch {
        // Keep defaults if request fails
      }
    })();
  }, []);

  const handlePayrollDefaultsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayrollLoading(true);
    try {
      const response = await fetch('/api/deduction-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          late_grace_minutes: parseInt(lateGraceMinutes, 10) || 5,
          standard_work_minutes: parseInt(standardWorkMinutes, 10) || 480,
          break_allowed_minutes: parseInt(breakAllowedMinutes, 10) || 60,
          overtime_multiplier: parseFloat(overtimeMultiplier) || 1.25,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      toast.success('Payroll defaults updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save payroll defaults.');
    } finally {
      setPayrollLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Computation Settings</h1>
            </div>
            <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                Configure payroll calculation defaults used by cutoff processing.
            </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Payroll defaults</CardTitle>
          <CardDescription>
            These settings control late grace, overtime threshold, break allowance, and overtime rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayrollDefaultsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="late-grace-minutes">Late grace minutes</Label>
              <Input id="late-grace-minutes" type="number" value={lateGraceMinutes} onChange={(e) => setLateGraceMinutes(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard-work-minutes">Standard work minutes/day</Label>
              <Input id="standard-work-minutes" type="number" value={standardWorkMinutes} onChange={(e) => setStandardWorkMinutes(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-allowed-minutes">Allowed regular break minutes/day</Label>
              <Input id="break-allowed-minutes" type="number" value={breakAllowedMinutes} onChange={(e) => setBreakAllowedMinutes(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime-multiplier">Overtime multiplier</Label>
              <Input id="overtime-multiplier" type="number" step="0.01" value={overtimeMultiplier} onChange={(e) => setOvertimeMultiplier(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={payrollLoading} className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-secondary hover:opacity-90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all flex items-center gap-1.5 sm:gap-2 w-fit cursor-pointer">
                {payrollLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save payroll defaults
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
