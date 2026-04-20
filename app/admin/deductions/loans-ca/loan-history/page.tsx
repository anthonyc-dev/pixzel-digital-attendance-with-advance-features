'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface LoanRow {
  id: string;
  loan_type: string;
  principal_amount: number;
  remaining_balance: number;
  start_date: string;
  end_date: string;
  status: string;
  employer_registration?: { employer_name?: string };
}

export default function LoanHistoryPage() {
  const [rows, setRows] = useState<LoanRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/loan-accounts`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Loan History</h1>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Type</th><th className="p-3 text-right">Amount</th><th className="p-3">Start</th><th className="p-3">End</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm">{r.employer_registration?.employer_name ?? '-'}</td>
                <td className="p-3 text-sm">{r.loan_type}</td>
                <td className="p-3 text-sm text-right">P{Number(r.principal_amount ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm">{r.start_date}</td>
                <td className="p-3 text-sm">{r.end_date ?? '-'}</td>
                <td className="p-3 text-sm">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
