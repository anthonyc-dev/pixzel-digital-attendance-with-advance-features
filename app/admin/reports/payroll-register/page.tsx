'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ENV } from '@/lib/api';

interface PayrollRow {
  id: string;
  full_name: string;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  period: string;
}

export default function PayrollRegisterPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/payroll`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  const totals = useMemo(() => ({
    gross: rows.reduce((a, b) => a + Number(b.gross_pay ?? 0), 0),
    deductions: rows.reduce((a, b) => a + Number(b.total_deduction ?? 0), 0),
    net: rows.reduce((a, b) => a + Number(b.net_pay ?? 0), 0),
  }), [rows]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Payroll Register</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="p-4 rounded-xl border"><p className="text-xs uppercase">Gross</p><p className="text-xl font-bold">P{totals.gross.toLocaleString()}</p></div>
        <div className="p-4 rounded-xl border"><p className="text-xs uppercase">Deductions</p><p className="text-xl font-bold">P{totals.deductions.toLocaleString()}</p></div>
        <div className="p-4 rounded-xl border"><p className="text-xs uppercase">Net</p><p className="text-xl font-bold">P{totals.net.toLocaleString()}</p></div>
      </div>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Period</th><th className="p-3 text-right">Gross</th><th className="p-3 text-right">Deduction</th><th className="p-3 text-right">Net</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm">{r.full_name}</td>
                <td className="p-3 text-sm">{r.period}</td>
                <td className="p-3 text-sm text-right">P{Number(r.gross_pay ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm text-right">P{Number(r.total_deduction ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm text-right font-bold">P{Number(r.net_pay ?? 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
