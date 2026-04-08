'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Percent,
    Save,
    Loader2,
    UserX,
    Timer,
    Banknote,
    HandCoins,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    MoreVertical,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DeductionSetting {
    id: number;
    late_deduction: number;
    absent_deduction: number;
    created_at: string;
}

interface LoanRecord {
    id: string;
    employee_name: string;
    total_amount: number;
    paid_amount: number;
    remaining: number;
    installment: number;
    status: 'Active' | 'Paid' | 'Overdue';
    last_payment_date: string;
}

interface CashAdvance {
    id: string;
    employee_name: string;
    amount: number;
    date: string;
    status: 'Pending' | 'Deducted' | 'Approved';
    reason: string;
}

const MOCK_LOANS: LoanRecord[] = [
    { id: 'LN-001', employee_name: 'John Doe', total_amount: 5000, paid_amount: 2000, remaining: 3000, installment: 500, status: 'Active', last_payment_date: '2026-03-30' },
    { id: 'LN-002', employee_name: 'Jane Smith', total_amount: 10000, paid_amount: 10000, remaining: 0, installment: 1000, status: 'Paid', last_payment_date: '2026-04-01' },
    { id: 'LN-003', employee_name: 'Mike Johnson', total_amount: 3000, paid_amount: 500, remaining: 2500, installment: 300, status: 'Overdue', last_payment_date: '2026-02-28' },
];

const MOCK_CA: CashAdvance[] = [
    { id: 'CA-001', employee_name: 'Sarah Wilson', amount: 1000, date: '2026-04-05', status: 'Pending', reason: 'Medical emergency' },
    { id: 'CA-002', employee_name: 'Chris Brown', amount: 500, date: '2026-04-02', status: 'Deducted', reason: 'Personal use' },
    { id: 'CA-003', employee_name: 'Alice Johnson', amount: 2000, date: '2026-04-07', status: 'Approved', reason: 'School fees' },
];

const DeductionSettingsPage = () => {
    const [current, setCurrent] = useState<DeductionSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [lateVal, setLateVal] = useState('');
    const [absentVal, setAbsentVal] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ENV.API_URL}/deduction-settings`);

            if (res.ok) {
                const data: DeductionSetting = await res.json();
                setCurrent(data);
                setLateVal(String(data.late_deduction));
                setAbsentVal(String(data.absent_deduction));
            }
        } catch (e) {
            console.error('Failed to fetch deduction settings:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!lateVal || !absentVal) return;
        setSaving(true);
        try {
            const res = await fetch(`${ENV.API_URL}/deduction-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    late_deduction: parseFloat(lateVal),
                    absent_deduction: parseFloat(absentVal),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCurrent(data);
                toast.success('Deduction rates saved successfully!');
                await fetchSettings();
            }
        } catch (e) {
            console.error('Failed to save deduction settings:', e);
            toast.error('Failed to save deduction settings.');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges =
        current &&
        (parseFloat(lateVal) !== current.late_deduction ||
            parseFloat(absentVal) !== current.absent_deduction);

    return (
        <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Deduction Management
                    </h1>
                    <p className="text-muted-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80">
                        Configure rates and manage employee loans and advances
                    </p>
                </div>
            </header>

            <Tabs defaultValue="rates" className="w-full space-y-6">
                <TabsList className="bg-transparent h-fit p-0 gap-2 flex-wrap">
                    <TabsTrigger value="rates" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                        Deduction Rates
                    </TabsTrigger>
                    <TabsTrigger value="loans" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                        Employee Loans
                    </TabsTrigger>
                    <TabsTrigger value="ca" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                        Cash Advances
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab: Rates ── */}
                <TabsContent value="rates" className="mt-0 outline-none">
                    <div className="bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-2xl p-8 shadow-sm flex flex-col gap-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                                <Percent className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-foreground">Global Deduction Rates</h2>
                                <p className="text-xs text-muted-foreground font-medium">Applied automatically during payroll computation</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Late deduction */}
                                <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/5 space-y-4 group hover:border-amber-500/30 transition-all">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <Timer className="w-4 h-4 text-amber-500" />
                                        Late Arrival Penalty
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg select-none">₱</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={lateVal}
                                            onChange={(e) => setLateVal(e.target.value)}
                                            className="w-full pl-10 pr-4 py-4 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all tabular-nums"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                                        Deducted per occurrence of late arrival
                                    </p>
                                </div>

                                {/* Absent deduction */}
                                <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/5 space-y-4 group hover:border-rose-500/30 transition-all">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <UserX className="w-4 h-4 text-rose-500" />
                                        Absenteeism Penalty
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg select-none">₱</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={absentVal}
                                            onChange={(e) => setAbsentVal(e.target.value)}
                                            className="w-full pl-10 pr-4 py-4 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all tabular-nums"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                                        Deducted per recorded full day of absence
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                            {!hasChanges && current ? (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    Rates are up to date
                                </p>
                            ) : (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                                    Unsaved changes detected
                                </p>
                            )}
                            
                            <button
                                onClick={handleSave}
                                disabled={saving || !hasChanges}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Syncing...</span></>
                                ) : (
                                    <><Save className="w-4 h-4" /><span>Save Rates</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </TabsContent>

                {/* ── Tab: Loans ── */}
                <TabsContent value="loans" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    placeholder="Search loans..." 
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/2 border border-gray-100 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 placeholder:text-muted-foreground/50 transition-all font-medium"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all">
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add New Loan</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4">Loan Progress</th>
                                            <th className="px-6 py-4">Installment</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {MOCK_LOANS.map((loan) => (
                                            <tr key={loan.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/1 transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                                                            <Banknote className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-foreground">{loan.employee_name}</p>
                                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{loan.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full max-w-[140px] space-y-2">
                                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                                                            <span className="text-secondary tracking-widest">₱{loan.paid_amount.toLocaleString()}</span>
                                                            <span className="text-muted-foreground tracking-widest">₱{loan.total_amount.toLocaleString()}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-secondary transition-all duration-1000" 
                                                                style={{ width: `${(loan.paid_amount / loan.total_amount) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black italic">₱{loan.installment.toLocaleString()} / mo</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest",
                                                        loan.status === 'Active' && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                                                        loan.status === 'Paid' && "bg-green-500/10 text-green-500 border border-green-500/20",
                                                        loan.status === 'Overdue' && "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                    )}>
                                                        {loan.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-muted-foreground">
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* ── Tab: CA ── */}
                <TabsContent value="ca" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_CA.map((ca) => (
                            <div key={ca.id} className="group p-5 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:border-secondary/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <HandCoins className="w-12 h-12 text-secondary" />
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">{ca.employee_name}</h3>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{ca.date}</p>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            ca.status === 'Pending' && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                                            ca.status === 'Deducted' && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                                            ca.status === 'Approved' && "bg-green-500/10 text-green-500 border border-green-500/20"
                                        )}>
                                            {ca.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-2xl font-black italic tracking-tight">₱{ca.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 opacity-70 italic">&quot;{ca.reason}&quot;</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold uppercase tracking-widest">
                                        <span className="text-muted-foreground opacity-50">{ca.id}</span>
                                        <button className="flex items-center gap-1 text-secondary hover:opacity-70 transition-all cursor-pointer">
                                            <span>Details</span>
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* New CA Card */}
                        <button className="p-5 rounded-2xl bg-white/40 dark:bg-white/1 border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 group hover:bg-white/60 dark:hover:bg-white/2 transition-all cursor-pointer">
                            <div className="p-2 rounded-full bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Cash Advance</span>
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DeductionSettingsPage;
