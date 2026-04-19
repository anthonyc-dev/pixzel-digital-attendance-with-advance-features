'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ENV } from '@/lib/api';
import { Plus } from 'lucide-react';

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
    if (adjRes.ok) setRows(await adjRes.json());
    if (empRes.ok) {
      const data = await empRes.json();
      setEmployees(Array.isArray(data) ? data : (data.data ?? []));
    }
  };

  useEffect(() => { load(); }, []);

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

      <div className="p-4 rounded-2xl border grid md:grid-cols-6 gap-3">
        <select value={form.employer_registration_id} onChange={(e) => setForm((p) => ({ ...p, employer_registration_id: e.target.value }))} className="px-3 py-2 rounded border md:col-span-2">
          <option value="">Select employee</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.employer_name} ({e.employer_id})</option>)}
        </select>
        <select value={form.adjustment_type} onChange={(e) => setForm((p) => ({ ...p, adjustment_type: e.target.value }))} className="px-3 py-2 rounded border">
          <option>Bonus</option><option>Allowance</option><option>Deduction</option><option>Correction</option>
        </select>
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="px-3 py-2 rounded border" />
        <input type="date" value={form.effective_date} onChange={(e) => setForm((p) => ({ ...p, effective_date: e.target.value }))} className="px-3 py-2 rounded border" />
        <button onClick={createAdjustment} className="px-3 py-2 rounded bg-secondary text-white font-bold text-xs flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> Add</button>
        <input placeholder="Reason" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} className="px-3 py-2 rounded border md:col-span-6" />
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
