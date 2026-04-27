"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ENV } from "@/lib/api";

interface DeductionRow {
  id: string;
  amount: number;
  frequency: string;
  employer_registration?: { employer_name?: string };
  deduction_catalog?: { code?: string; name?: string };
}

export default function DeductionSummaryPage() {
  const [rows, setRows] = useState<DeductionRow[]>([]);
  useEffect(() => {
    fetch(`${ENV.API_URL}/employee-recurring-deductions`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  const totals = useMemo(() => {
    const byCode: Record<string, number> = {};
    rows.forEach((r) => {
      const code = r.deduction_catalog?.code ?? "OTHER";
      byCode[code] = (byCode[code] ?? 0) + Number(r.amount ?? 0);
    });
    return byCode;
  }, [rows]);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Deduction Summary</h1>
        <div className="grid gap-3 md:grid-cols-4">
          {Object.entries(totals).map(([code, value]) => (
            <div key={code} className="p-4 rounded-xl border">
              <p className="text-xs uppercase">{code}</p>
              <p className="text-xl font-bold">P{value.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap">Employee</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap">Deduction</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap">Frequency</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 text-sm">
                    {r.employer_registration?.employer_name ?? "-"}
                  </td>
                  <td className="p-3 text-sm">
                    {r.deduction_catalog?.name ??
                      r.deduction_catalog?.code ??
                      "Unknown"}
                  </td>
                  <td className="p-3 text-sm">{r.frequency}</td>
                  <td className="p-3 text-sm text-right">
                    P{Number(r.amount ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
