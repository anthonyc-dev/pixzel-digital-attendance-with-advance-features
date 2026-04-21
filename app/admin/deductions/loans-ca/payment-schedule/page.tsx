'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface LoanRow {
  id: string;
  loan_type: string;
  remaining_balance: number;
  monthly_payment: number;
  end_date: string;
  status: string;
  employer_registration?: { employer_name?: string };
}

export default function PaymentSchedulePage() {
  const [rows, setRows] = useState<LoanRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/loan-accounts?status=active`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Schedule</h1>
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Loan Type</th><th className="p-3 text-right">Remaining</th><th className="p-3 text-right">Monthly</th><th className="p-3">Target End</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 text-sm">{r.employer_registration?.employer_name ?? '-'}</td>
                  <td className="p-3 text-sm">{r.loan_type}</td>
                  <td className="p-3 text-sm text-right">P{Number(r.remaining_balance ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm text-right">P{Number(r.monthly_payment ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{r.end_date ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
