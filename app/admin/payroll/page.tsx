'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
    Banknote,
    Search,
    Download,
    ChevronRight,
    TrendingUp,
    Wallet,
    CreditCard,
    History,
    DollarSign,
    PieChart,
    ArrowUpRight,
    Printer,
    ChevronDown,
    Info
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Employee {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    status: string;
    image: string | null;
    created_at: string;
}

const PayrollPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('/api/registration');
                if (response.ok) {
                    const result = await response.json();
                    setEmployees(result.data || []);
                }
            } catch (e) {
                console.error('Failed to fetch employers:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const stats = [
        { title: 'Total Payroll', value: '₱ 245K', sub: '+12%', icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Avg Salary', value: '₱ 24.5K', sub: 'Per Emp', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Deductions', value: '₱ 12.4K', sub: 'Tax/Ins', icon: PieChart, color: 'text-red-500', bg: 'bg-red-500/10' },
        { title: 'Paid Today', value: '08', sub: 'People', icon: CreditCard, color: 'text-secondary', bg: 'bg-secondary/10' },
    ];

    const filteredEmployees = employees.filter(emp =>
        emp.employer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employer_position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

                {/* Page Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                            <History className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Aug 1 - Aug 31</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">Employee Payroll</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                            <Printer className="w-3.5 h-3.5 text-secondary" />
                            <span>Print</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all">
                            <Download className="w-3.5 h-3.5" />
                            <span>Export</span>
                        </button>
                    </div>
                </header>

                {/* Stats Section */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group hover:scale-[1.01] transition-all relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.title}</div>
                                    <div className="text-[8px] font-bold text-green-500 flex items-center gap-1">
                                        <TrendingUp className="w-2 h-2" />
                                        {stat.sub}
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter flex items-center gap-1">
                                {stat.value}
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Filters and List */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 transition-all shadow-sm">
                                <span>Status</span>
                                <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                            </button>
                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-secondary/10">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Process</span>
                            </button>
                        </div>
                    </div>

                    {/* List Wrapper */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/10 border-b border-gray-100 dark:border-white/5">
                                    <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Employee</th>
                                    <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Basic</th>
                                    <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Hours</th>
                                    <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Deductions</th>
                                    <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Net Pay</th>
                                    <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={6} className="p-5"><div className="h-12 bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {emp.image ? (
                                                            <Image src={emp.image} alt={emp.employer_name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover border border-white dark:border-white/10 shadow-md transition-all" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-lg font-black text-secondary">
                                                                {emp.employer_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm tracking-tight group-hover:text-secondary transition-colors">{emp.employer_name}</span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{emp.employer_position}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 font-black text-foreground/80 tabular-nums text-xs">₱ 28,000</td>
                                            <td className="p-5">
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-black text-foreground text-xs">176h</span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">22 Days</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-red-500/80 font-black tabular-nums text-xs">-₱ 1,450</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm text-foreground tracking-tighter">₱ 26,550</span>
                                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-black uppercase tracking-[0.1em] rounded-lg border border-green-600/20">
                                                        Processed
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
};

export default PayrollPage;
