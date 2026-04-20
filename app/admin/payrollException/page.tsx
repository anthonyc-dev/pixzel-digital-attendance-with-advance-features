'use client';

import React, { useEffect, startTransition, useState } from 'react';
import { ENV } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';

const fieldClass =
  'px-3 py-2 rounded border bg-white text-black placeholder:text-neutral-500 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 border-gray-300 dark:border-white/20 w-full min-w-0';
const selectFieldClass = `${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`;

interface Employer { id: number; employer_name: string; employer_id: string }
interface ExceptionRow {
  id: string;
  exception_type: string;
  description: string;
  amount_impact: number;
  status: 'open' | 'resolved' | 'ignored';
  created_at: string;
  employer_registration?: Employer;
}

const PayrollException = () => {
  const [rows, setRows] = useState<ExceptionRow[]>([]);
  const [employees, setEmployees] = useState<Employer[]>([]);
  const [form, setForm] = useState({
    employer_registration_id: '',
    exception_type: '',
    description: '',
    amount_impact: '',
  });

  const load = async () => {
    const [exRes, empRes] = await Promise.all([
      fetch(`${ENV.API_URL}/payroll-exceptions`, { cache: 'no-store' }),
      fetch(`${ENV.API_URL}/registration`, { cache: 'no-store' }),
    ]);
    if (exRes.ok) {
      const list = await exRes.json();
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

  const createException = async () => {
    if (!form.employer_registration_id || !form.exception_type || !form.description) return;
    const res = await fetch(`${ENV.API_URL}/payroll-exceptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employer_registration_id: Number(form.employer_registration_id),
        exception_type: form.exception_type,
        description: form.description,
        amount_impact: Number(form.amount_impact || 0),
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setRows((prev) => [created, ...prev]);
      setForm({ employer_registration_id: '', exception_type: '', description: '', amount_impact: '' });
    }
  };

  const resolve = async (row: ExceptionRow) => {
    const res = await fetch(`${ENV.API_URL}/payroll-exceptions/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolved_at: new Date().toISOString() }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'resolved' } : r)));
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl pb-20">
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Payroll Exceptions</h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80 mt-1">
          Review and resolve payroll issues
        </p>
      </header>

      <div className="p-4 rounded-2xl border">
        <div className="grid md:grid-cols-4 gap-x-4 gap-y-4">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="pe-employee">Employee</Label>
            <select
              id="pe-employee"
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
            <Label htmlFor="pe-type">Exception type</Label>
            <input
              id="pe-type"
              placeholder="e.g. Missing clock-out, wrong rate"
              value={form.exception_type}
              onChange={(e) => setForm((p) => ({ ...p, exception_type: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="pe-impact">Amount impact (PHP)</Label>
            <input
              id="pe-impact"
              type="number"
              step="0.01"
              placeholder="Optional; 0 if none"
              value={form.amount_impact}
              onChange={(e) => setForm((p) => ({ ...p, amount_impact: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div className="flex min-w-0 flex-col justify-end">
            <button type="button" onClick={createException} className="px-3 py-2 rounded bg-secondary text-white text-xs font-bold">
              Add Exception
            </button>
          </div>
          <div className="space-y-2 min-w-0 md:col-span-4">
            <Label htmlFor="pe-description">Description</Label>
            <input
              id="pe-description"
              placeholder="What happened and what should payroll do about it?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Type</th><th className="p-3">Description</th><th className="p-3">Impact</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 text-sm font-medium">{row.employer_registration?.employer_name ?? '-'}</td>
                <td className="p-3 text-sm">{row.exception_type}</td>
                <td className="p-3 text-sm">{row.description}</td>
                <td className="p-3 text-sm">{row.amount_impact}</td>
                <td className="p-3 text-sm">{row.status}</td>
                <td className="p-3 text-right">
                  <button disabled={row.status === 'resolved'} onClick={() => resolve(row)} className="px-3 py-1.5 rounded bg-secondary text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollException;
