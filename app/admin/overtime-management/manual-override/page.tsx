'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface OverrideRow {
  id: string;
  original_hours: number;
  adjusted_hours: number;
  reason: string;
  actor: string;
  created_at: string;
  overtime_entries?: {
    employer_registration?: { employer_name?: string; employer_id?: string };
    work_date?: string;
  };
}

export default function OvertimeManualOverridePage() {
  const [rows, setRows] = useState<OverrideRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/overtime-overrides`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Overtime Manual Override</h1>
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Date</th><th className="p-3 text-right">Original</th><th className="p-3 text-right">Adjusted</th><th className="p-3">Reason</th><th className="p-3">Actor</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 text-sm">{r.overtime_entries?.employer_registration?.employer_name ?? '-'}</td>
                  <td className="p-3 text-sm">{r.overtime_entries?.work_date ?? '-'}</td>
                  <td className="p-3 text-sm text-right">{Number(r.original_hours ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-sm text-right">{Number(r.adjusted_hours ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-sm">{r.reason}</td>
                  <td className="p-3 text-sm">{r.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
