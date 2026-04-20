'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

const fieldClass =
  'px-3 py-2 rounded border bg-white text-black placeholder:text-neutral-500 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 border-gray-300 dark:border-white/20 w-full';
const dateFieldClass = `${fieldClass} [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-moz-calendar-picker-indicator]:cursor-pointer [&::-moz-calendar-picker-indicator]:opacity-100 [&::-moz-calendar-picker-indicator]:dark:invert`;

interface Employer { id: number; employer_name: string; employer_id: string }
interface OvertimeRow {
  id: string;
  employer_registration_id: number;
  work_date: string;
  hours: number;
  rate_multiplier: number;
  computed_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  remarks: string;
  employer_registration?: Employer;
}

const Overtime = () => {
  const [rows, setRows] = useState<OvertimeRow[]>([]);
  const [employees, setEmployees] = useState<Employer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    employer_registration_id: '',
    work_date: '',
    hours: '',
    rate_multiplier: '1.5',
    remarks: '',
  });

  const load = async () => {
    setErrorMessage('');
    const [otRes, empRes] = await Promise.all([
      fetch('/api/overtime', { cache: 'no-store' }),
      fetch('/api/registration', { cache: 'no-store' }),
    ]);

    if (otRes.ok) {
      const data = await otRes.json();
      setRows(Array.isArray(data) ? data : []);
    } else {
      const error = await otRes.json().catch(() => ({ error: 'Failed to load overtime records.' }));
      setErrorMessage(error.error ?? 'Failed to load overtime records.');
    }

    if (empRes.ok) {
      const data = await empRes.json();
      setEmployees(Array.isArray(data) ? data : (data.data ?? []));
    } else {
      const error = await empRes.json().catch(() => ({ error: 'Failed to load employees.' }));
      setErrorMessage((prev) => prev || error.error || 'Failed to load employees.');
    }
  };
  useEffect(() => { load(); }, []);

  const createOt = async () => {
    setErrorMessage('');
    if (!form.employer_registration_id || !form.work_date || !form.hours) {
      setErrorMessage('Please complete employee, date, and hours.');
      return;
    }

    const hours = Number(form.hours);
    const rateMultiplier = Number(form.rate_multiplier || 1.5);
    if (!Number.isFinite(hours) || hours <= 0 || !Number.isFinite(rateMultiplier) || rateMultiplier <= 0) {
      setErrorMessage('Hours and rate must be valid positive numbers.');
      return;
    }

    const computedAmount = hours * 100 * rateMultiplier;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employer_registration_id: Number(form.employer_registration_id),
          work_date: form.work_date,
          hours,
          rate_multiplier: rateMultiplier,
          computed_amount: computedAmount,
          remarks: form.remarks,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to add overtime entry.' }));
        setErrorMessage(error.error ?? 'Failed to add overtime entry.');
        return;
      }

      setForm({ employer_registration_id: '', work_date: '', hours: '', rate_multiplier: '1.5', remarks: '' });
      await load();
    } catch (error) {
      setErrorMessage(`Failed to add overtime entry: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setStatus = async (row: OvertimeRow, status: OvertimeRow['status']) => {
    setErrorMessage('');
    const res = await fetch(`/api/overtime/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    } else {
      const error = await res.json().catch(() => ({ error: 'Failed to update overtime status.' }));
      setErrorMessage(error.error ?? 'Failed to update overtime status.');
    }
  };

  const stats = useMemo(() => {
    const totalHours = rows.reduce((acc, curr) => acc + Number(curr.hours || 0), 0);
    const pendingCount = rows.filter((r) => r.status === 'pending').length;
    const totalAmount = rows.reduce((acc, curr) => acc + Number(curr.computed_amount || 0), 0);
    return { totalHours, pendingCount, totalAmount };
  }, [rows]);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl pb-20">
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Overtime Management</h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80 mt-1">
          Record overtime and approve entries
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border"><p className="text-xs uppercase font-bold">Total OT Hours</p><p className="text-2xl font-bold">{stats.totalHours.toFixed(2)}</p></div>
        <div className="p-6 rounded-2xl border"><p className="text-xs uppercase font-bold">Pending</p><p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p></div>
        <div className="p-6 rounded-2xl border"><p className="text-xs uppercase font-bold">Estimated Cost</p><p className="text-2xl font-bold">P{stats.totalAmount.toFixed(2)}</p></div>
      </div>

      <div className="p-4 md:p-6 rounded-2xl border space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Add overtime entry</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose who worked overtime, the date, and hours. Rate multiplies the computed amount (e.g. 1.5×).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-4 gap-y-5">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="ot-employee">Employee</Label>
            <select
              id="ot-employee"
              value={form.employer_registration_id}
              onChange={(e) => setForm((p) => ({ ...p, employer_registration_id: e.target.value }))}
              className={fieldClass}
            >
              <option value="">Select an employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employer_name} ({e.employer_id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="ot-work-date">Work date</Label>
            <input
              id="ot-work-date"
              type="date"
              value={form.work_date}
              onChange={(e) => setForm((p) => ({ ...p, work_date: e.target.value }))}
              className={dateFieldClass}
              aria-describedby="ot-work-date-hint"
            />
            <p id="ot-work-date-hint" className="text-xs text-muted-foreground">
              The calendar day the overtime was performed.
            </p>
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="ot-hours">Hours</Label>
            <input
              id="ot-hours"
              type="number"
              min={0}
              step="0.25"
              placeholder="0"
              value={form.hours}
              onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))}
              className={fieldClass}
              aria-describedby="ot-hours-hint"
            />
            <p id="ot-hours-hint" className="text-xs text-muted-foreground">
              Overtime hours for that date. Required.
            </p>
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="ot-rate">Rate multiplier</Label>
            <input
              id="ot-rate"
              type="number"
              min={0}
              step="0.1"
              placeholder="1.5"
              value={form.rate_multiplier}
              onChange={(e) => setForm((p) => ({ ...p, rate_multiplier: e.target.value }))}
              className={fieldClass}
              aria-describedby="ot-rate-hint"
            />
            <p id="ot-rate-hint" className="text-xs text-muted-foreground">
              Applied to hourly equivalent (e.g. 1.5 for time-and-a-half).
            </p>
          </div>

          <div className="space-y-2 md:col-span-2 min-w-0">
            <Label htmlFor="ot-remarks">Remarks</Label>
            <input
              id="ot-remarks"
              placeholder="Optional — project, shift, or approval note"
              value={form.remarks}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={createOt}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Adding…' : 'Add overtime'}
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Date</th><th className="p-3">Hours</th><th className="p-3">Rate</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 text-sm font-medium">{row.employer_registration?.employer_name ?? '-'}</td>
                <td className="p-3 text-sm">{row.work_date}</td>
                <td className="p-3 text-sm">{row.hours}</td>
                <td className="p-3 text-sm">{row.rate_multiplier}x</td>
                <td className="p-3 text-sm">P{Number(row.computed_amount ?? 0).toFixed(2)}</td>
                <td className="p-3 text-sm">{row.status}</td>
                <td className="p-3 text-right">
                  <button disabled={row.status === 'approved'} onClick={() => setStatus(row, 'approved')} className="px-2 py-1 rounded bg-emerald-600 text-white text-xs mr-2 disabled:opacity-50 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Approve</button>
                  <button disabled={row.status === 'rejected'} onClick={() => setStatus(row, 'rejected')} className="px-2 py-1 rounded bg-amber-600 text-white text-xs disabled:opacity-50 inline-flex items-center gap-1"><Clock className="w-3 h-3" />Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Overtime;
