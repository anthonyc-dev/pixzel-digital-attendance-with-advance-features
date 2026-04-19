'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface DeductionRow {
  id: string;
  amount: number;
  frequency: string;
  start_date: string;
  is_active: boolean;
  employer_registration?: { employer_name?: string; employer_id?: string };
  deduction_catalog?: { code?: string; name?: string; id?: number };
}

export default function OtherDeductionsPage() {
  const [rows, setRows] = useState<DeductionRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/employee-recurring-deductions`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Other Deductions</h1>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Type</th><th className="p-3">Frequency</th><th className="p-3 text-right">Amount</th><th className="p-3">Active</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm">{r.employer_registration?.employer_name ?? '-'}</td>
                <td className="p-3 text-sm">{r.deduction_catalog?.name ?? r.deduction_catalog?.code ?? '-'}</td>
                <td className="p-3 text-sm">{r.frequency}</td>
                <td className="p-3 text-sm text-right">P{Number(r.amount ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm">{r.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
