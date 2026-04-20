'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ENV } from '@/lib/api';

interface OvertimeRow {
  id: string;
  hours: number;
  computed_amount: number;
  status: string;
  work_date: string;
  employer_registration?: { employer_name?: string };
}

export default function OvertimeReportPage() {
  const [rows, setRows] = useState<OvertimeRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/overtime`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  const stats = useMemo(() => ({
    totalHours: rows.reduce((a, b) => a + Number(b.hours ?? 0), 0),
    totalAmount: rows.reduce((a, b) => a + Number(b.computed_amount ?? 0), 0),
    approved: rows.filter((r) => r.status === 'approved').length,
  }), [rows]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Overtime Report</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="p-4 rounded-xl border"><p className="text-xs uppercase">Total Hours</p><p className="text-xl font-bold">{stats.totalHours.toFixed(2)}</p></div>
        <div className="p-4 rounded-xl border"><p className="text-xs uppercase">Total Amount</p><p className="text-xl font-bold">P{stats.totalAmount.toLocaleString()}</p></div>
        <div className="p-4 rounded-xl border"><p className="text-xs uppercase">Approved</p><p className="text-xl font-bold">{stats.approved}</p></div>
      </div>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Date</th><th className="p-3 text-right">Hours</th><th className="p-3 text-right">Amount</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm">{r.employer_registration?.employer_name ?? '-'}</td>
                <td className="p-3 text-sm">{r.work_date}</td>
                <td className="p-3 text-sm text-right">{Number(r.hours ?? 0).toFixed(2)}</td>
                <td className="p-3 text-sm text-right">P{Number(r.computed_amount ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
