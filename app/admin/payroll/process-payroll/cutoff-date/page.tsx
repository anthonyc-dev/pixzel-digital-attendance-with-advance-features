'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface PeriodRow {
  id: number;
  period_label: string;
  period_start: string;
  period_end: string;
  cutoff_date: string;
  is_open: boolean;
}

export default function CutoffDatePage() {
  const [rows, setRows] = useState<PeriodRow[]>([]);
  const [form, setForm] = useState({ period_label: '', period_start: '', period_end: '', cutoff_date: '' });

  const load = () =>
    fetch(`${ENV.API_URL}/payroll-periods`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));

  useEffect(() => { load(); }, []);

  const createPeriod = async () => {
    if (!form.period_start || !form.period_end) return;
    const res = await fetch(`${ENV.API_URL}/payroll-periods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ period_label: '', period_start: '', period_end: '', cutoff_date: '' });
      load();
    }
  };

  return (  
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Cutoff Date</h1>
        <div className="p-4 rounded-2xl border grid md:grid-cols-5 gap-3">
          <input placeholder="Label" value={form.period_label} onChange={(e) => setForm((p) => ({ ...p, period_label: e.target.value }))} className="px-3 py-2 rounded border" />
          <input type="date" value={form.period_start} onChange={(e) => setForm((p) => ({ ...p, period_start: e.target.value }))} className="px-3 py-2 rounded border" />
          <input type="date" value={form.period_end} onChange={(e) => setForm((p) => ({ ...p, period_end: e.target.value }))} className="px-3 py-2 rounded border" />
          <input type="date" value={form.cutoff_date} onChange={(e) => setForm((p) => ({ ...p, cutoff_date: e.target.value }))} className="px-3 py-2 rounded border" />
          <button onClick={createPeriod} className="px-3 py-2 rounded bg-secondary text-white text-xs font-bold">Save</button>
        </div>
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Label</th><th className="p-3">Start</th><th className="p-3">End</th><th className="p-3">Cutoff</th><th className="p-3">Open</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id} className="border-t"><td className="p-3 text-sm">{r.period_label ?? '-'}</td><td className="p-3 text-sm">{r.period_start}</td><td className="p-3 text-sm">{r.period_end}</td><td className="p-3 text-sm">{r.cutoff_date ?? '-'}</td><td className="p-3 text-sm">{r.is_open ? 'Yes' : 'No'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
