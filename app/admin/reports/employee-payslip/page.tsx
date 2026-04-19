'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface PayrollRow {
  id: string;
  full_name: string;
  period: string;
  base_salary: number;
  total_deduction: number;
  net_pay: number;
  status: string;
}

export default function EmployeePayslipPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/payroll`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Employee Payslip</h1>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Period</th><th className="p-3 text-right">Gross</th><th className="p-3 text-right">Deduction</th><th className="p-3 text-right">Net</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm font-medium">{r.full_name}</td>
                <td className="p-3 text-sm">{r.period}</td>
                <td className="p-3 text-sm text-right">P{Number(r.base_salary ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm text-right">P{Number(r.total_deduction ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm text-right font-bold">P{Number(r.net_pay ?? 0).toLocaleString()}</td>
                <td className="p-3 text-sm">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
