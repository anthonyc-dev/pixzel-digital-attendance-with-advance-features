'use client';

import React, { useEffect, useMemo, startTransition, useState } from 'react';
import { ENV } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

const fieldClass =
  'px-3 py-2 rounded border bg-white text-black placeholder:text-neutral-500 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 border-gray-300 dark:border-white/20 w-full min-w-0';
const selectFieldClass = `${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`;

interface Employer { 
  id: number; 
  employer_name: string; 
  employer_id: string 
}

interface Adjustment {
  id: string;
  adjustment_type: string;
  amount: number;
  reason: string;
  effective_date: string;
  employer_registration?: Employer;
}

const PayrollAdjustment = () => {
  const [rows, setRows] = useState<Adjustment[]>([]);
  const [employees, setEmployees] = useState<Employer[]>([]);
  const [form, setForm] = useState({
    employer_registration_id: '',
    adjustment_type: 'Bonus',
    amount: '',
    reason: '',
    effective_date: '',
  });

  const load = async () => {
    const [adjRes, empRes] = await Promise.all([
      fetch(`${ENV.API_URL}/payroll-adjustments`, { cache: 'no-store' }),
      fetch(`${ENV.API_URL}/registration`, { cache: 'no-store' }),
    ]);
    if (adjRes.ok) {
      const list = await adjRes.json();
      startTransition(() => setRows(list));
    }
    if (empRes.ok) {
      const data = await empRes.json();
      const list = Array.isArray(data) ? data : (data.data ?? []);
      startTransition(() => setEmployees(list));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createAdjustment = async () => {
    if (!form.employer_registration_id || !form.amount || !form.reason || !form.effective_date) return;
    const amount = Number(form.amount);
    const signedAmount = form.adjustment_type === 'Deduction' ? -Math.abs(amount) : Math.abs(amount);
    const res = await fetch(`${ENV.API_URL}/payroll-adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employer_registration_id: Number(form.employer_registration_id),
        adjustment_type: form.adjustment_type,
        amount: signedAmount,
        reason: form.reason,
        effective_date: form.effective_date,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setRows((prev) => [created, ...prev]);
      setForm({ employer_registration_id: '', adjustment_type: 'Bonus', amount: '', reason: '', effective_date: '' });
    }
  };

  const totalAdditions = useMemo(() => rows.filter((r) => r.amount > 0).reduce((a, b) => a + b.amount, 0), [rows]);
  const totalDeductions = useMemo(() => rows.filter((r) => r.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0), [rows]);
  const netImpact = totalAdditions - totalDeductions;

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl pb-20">
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Payroll Adjustments</h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80 mt-1">
          Manual additions and deductions linked to employees
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border"><p className="text-xs uppercase font-bold">Additions</p><p className="text-2xl font-bold text-green-600">+P{totalAdditions.toFixed(2)}</p></div>
        <div className="p-6 rounded-2xl border"><p className="text-xs uppercase font-bold">Deductions</p><p className="text-2xl font-bold text-red-600">-P{totalDeductions.toFixed(2)}</p></div>
        <div className="p-6 rounded-2xl border"><p className="text-xs uppercase font-bold">Net Impact</p><p className="text-2xl font-bold">{netImpact >= 0 ? '+' : ''}P{netImpact.toFixed(2)}</p></div>
      </div>

      <div className="p-4 rounded-2xl border">
        <div className="grid md:grid-cols-6 gap-x-4 gap-y-4">
          <div className="space-y-2 min-w-0 md:col-span-2">
            <Label htmlFor="pa-employee">Employee</Label>
            <select
              id="pa-employee"
              value={form.employer_registration_id}
              onChange={(e) => setForm((p) => ({ ...p, employer_registration_id: e.target.value }))}
              className={selectFieldClass}
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employer_name} ({e.employer_id})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="pa-type">Adjustment type</Label>
            <select
              id="pa-type"
              value={form.adjustment_type}
              onChange={(e) => setForm((p) => ({ ...p, adjustment_type: e.target.value }))}
              className={selectFieldClass}
            >
              <option>Bonus</option>
              <option>Allowance</option>
              <option>Deduction</option>
              <option>Correction</option>
            </select>
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="pa-amount">Amount (PHP)</Label>
            <input
              id="pa-amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="pa-effective-date">Effective date</Label>
            <input
              id="pa-effective-date"
              type="date"
              value={form.effective_date}
              onChange={(e) => setForm((p) => ({ ...p, effective_date: e.target.value }))}
              className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert`}
            />
          </div>
          <div className="flex min-w-0 flex-col justify-end md:col-span-1">
            <button
              type="button"
              onClick={createAdjustment}
              className="px-3 py-2 rounded bg-secondary text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" aria-hidden /> Add
            </button>
          </div>
          <div className="space-y-2 min-w-0 md:col-span-6">
            <Label htmlFor="pa-reason">Reason</Label>
            <input
              id="pa-reason"
              placeholder="Short note shown on payroll (e.g. performance bonus, uniform fee)"
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Type</th><th className="p-3">Reason</th><th className="p-3">Date</th><th className="p-3 text-right">Amount</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm font-medium">{r.employer_registration?.employer_name ?? '-'}</td>
                <td className="p-3 text-sm">{r.adjustment_type}</td>
                <td className="p-3 text-sm">{r.reason}</td>
                <td className="p-3 text-sm">{r.effective_date}</td>
                <td className={`p-3 text-sm text-right font-bold ${r.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.amount >= 0 ? '+' : '-'}P{Math.abs(r.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollAdjustment;
