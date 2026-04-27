'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ENV } from '@/lib/api';

interface LeaveRow {
  id: number;
  employee_name: string;
  employer_id?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status?: string;
}

const dayDiff = (a: string, b: string) => {
  const start = new Date(a);
  const end = new Date(b);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
};

export default function LeaveBalanceAdminPage() {
  const [rows, setRows] = useState<LeaveRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/leave`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  const summary = useMemo(() => {
    const byEmployee: Record<string, { name: string; used: number; credits: number }> = {};
    rows.forEach((r) => {
      const key = r.employer_id ?? r.employee_name;
      if (!byEmployee[key]) byEmployee[key] = { name: r.employee_name, used: 0, credits: 10 };
      byEmployee[key].used += dayDiff(r.start_date, r.end_date);
    });
    return Object.values(byEmployee).map((v) => ({ ...v, remaining: Math.max(0, v.credits - v.used) }));
  }, [rows]);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Leave Balance</h1>
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3 text-right">Credits/Year</th><th className="p-3 text-right">Used</th><th className="p-3 text-right">Remaining</th></tr></thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.name} className="border-t">
                  <td className="p-3 text-sm font-medium">{s.name}</td>
                  <td className="p-3 text-sm text-right">{s.credits}</td>
                  <td className="p-3 text-sm text-right">{s.used}</td>
                  <td className="p-3 text-sm text-right font-bold">{s.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
