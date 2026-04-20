'use client';

import React, { useEffect, useState } from 'react';
import { ENV } from '@/lib/api';

interface LeaveRow {
  id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
}

export default function LeaveManualOverrideAdminPage() {
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetch(`${ENV.API_URL}/leave`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Leave Manual Override</h1>
      <div className="p-4 rounded-2xl border space-y-2">
        <p className="text-sm text-muted-foreground">Audit-ready manual override note (for HR/Payroll):</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full min-h-24 rounded border px-3 py-2" placeholder="Reason for override..." />
      </div>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-muted/40 text-xs uppercase"><th className="p-3">Employee</th><th className="p-3">Type</th><th className="p-3">Start</th><th className="p-3">End</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-sm">{r.employee_name}</td>
                <td className="p-3 text-sm">{r.leave_type}</td>
                <td className="p-3 text-sm">{r.start_date}</td>
                <td className="p-3 text-sm">{r.end_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
