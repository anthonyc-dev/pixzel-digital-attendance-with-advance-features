'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ENV } from '@/lib/api';

interface DeductionRow {
  id: string;
  amount: number;
  deduction_catalog?: { code?: string; name?: string };
}

export default function DeductionReportPage() {
  const [rows, setRows] = useState<DeductionRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/employee-recurring-deductions`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  const totals = useMemo(() => {
    const output: Record<string, number> = {};
    rows.forEach((r) => {
      const key = r.deduction_catalog?.code ?? 'OTHER';
      output[key] = (output[key] ?? 0) + Number(r.amount ?? 0);
    });
    return output;
  }, [rows]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Deduction Report</h1>
      <div className="grid gap-3 md:grid-cols-4">
        {Object.entries(totals).map(([k, v]) => (
          <div key={k} className="p-4 rounded-xl border"><p className="text-xs uppercase">{k}</p><p className="text-xl font-bold">P{v.toLocaleString()}</p></div>
        ))}
      </div>
    </div>
  );
}
