"use client";

import React, { useEffect, useState } from "react";
import { ENV } from "@/lib/api";

interface LoanRow {
  id: string;
  loan_type: string;
  principal_amount: number;
  remaining_balance: number;
  monthly_payment: number;
  status: string;
  employer_registration?: { employer_name?: string; employer_id?: string };
}

export default function LoanBalanceReportPage() {
  const [rows, setRows] = useState<LoanRow[]>([]);

  useEffect(() => {
    fetch(`${ENV.API_URL}/loan-accounts`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Loan Balance Report
        </h1>
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-xs uppercase">
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap">Employee</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap">Loan Type</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap text-right">Principal</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap text-right">Remaining</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap text-right">Monthly</th>
                <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-24 whitespace-nowrap text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 text-sm font-medium">
                    {r.employer_registration?.employer_name ?? "-"}
                  </td>
                  <td className="p-3 text-sm">{r.loan_type}</td>
                  <td className="p-3 text-sm text-right">
                    P{Number(r.principal_amount ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-right">
                    P{Number(r.remaining_balance ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-right">
                    P{Number(r.monthly_payment ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
