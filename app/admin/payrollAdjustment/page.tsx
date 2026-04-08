'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCcw,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PayrollAdjustment {
    id: string;
    employee_name: string;
    type: 'Deduction' | 'Addition';
    source: string; // Exception ID or OT ID
    reason: string;
    amount: number;
    status: 'Pending Sync' | 'Synced';
    date: string;
}

const MOCK_ADJUSTMENTS: PayrollAdjustment[] = [
    { id: 'ADJ-001', employee_name: 'Charlie Davis', type: 'Deduction', source: 'EX-003', reason: 'Unpaid Leave (Late Submission)', amount: 450.00, status: 'Pending Sync', date: '2026-04-06' },
    { id: 'ADJ-002', employee_name: 'John Doe', type: 'Addition', source: 'OT-001', reason: 'Regular Overtime (2h)', amount: 50.00, status: 'Synced', date: '2026-04-01' },
    { id: 'ADJ-003', employee_name: 'Mike Johnson', type: 'Addition', source: 'OT-003', reason: 'Holiday Overtime (8h)', amount: 320.00, status: 'Synced', date: '2026-04-03' },
];

const PayrollAdjustment = () => {
    const totalAdditions = MOCK_ADJUSTMENTS.filter(a => a.type === 'Addition').reduce((acc, curr) => acc + curr.amount, 0);
    const totalDeductions = MOCK_ADJUSTMENTS.filter(a => a.type === 'Deduction').reduce((acc, curr) => acc + curr.amount, 0);
    const netImpact = totalAdditions - totalDeductions;

    return (
        <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Payroll Adjustments
                    </h1>
                    <p className="text-muted-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80">
                        Finalized changes for the current payroll cycle
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Sync with Payroll</span>
                    </button>
                </div>
            </header>

            {/* Impact Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Additions</p>
                        <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-500">+${totalAdditions.toFixed(2)}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Deductions</p>
                        <ArrowDownCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-rose-500">-${totalDeductions.toFixed(2)}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-secondary text-white shadow-xl shadow-secondary/20 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Calculator className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Net Payroll Impact</p>
                        <h3 className="text-2xl font-bold">
                            {netImpact >= 0 ? '+' : ''}${netImpact.toFixed(2)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Adjustments Table */}
            <div className="bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                <th className="px-6 py-5">Employee</th>
                                <th className="px-6 py-5">Reference</th>
                                <th className="px-6 py-5">Adjustment Details</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {MOCK_ADJUSTMENTS.map((adj) => (
                                <tr key={adj.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/1 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-foreground font-bold text-xs group-hover:bg-secondary group-hover:text-white transition-all">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{adj.employee_name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{adj.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{adj.source}</span>
                                            <ExternalLink className="w-3 h-3 text-secondary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-foreground">{adj.reason}</p>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                adj.type === 'Addition' ? "text-green-500" : "text-rose-500"
                                            )}>
                                                {adj.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-sm font-black",
                                            adj.type === 'Addition' ? "text-green-600" : "text-rose-600"
                                        )}>
                                            {adj.type === 'Addition' ? '+' : '-'}${adj.amount.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                adj.status === 'Synced' ? "bg-green-500" : "bg-amber-500"
                                            )} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{adj.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground transition-colors cursor-pointer">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayrollAdjustment;