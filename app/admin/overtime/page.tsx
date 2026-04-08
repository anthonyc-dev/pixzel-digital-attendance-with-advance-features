'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OvertimeRecord {
    id: string;
    employee_name: string;
    date: string;
    hours: number;
    type: 'Regular' | 'Rest Day' | 'Holiday';
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
    amount?: number;
}

const MOCK_OVERTIME: OvertimeRecord[] = [
    { id: 'OT-001', employee_name: 'John Doe', date: '2026-04-01', hours: 2, type: 'Regular', status: 'Approved', reason: 'System Maintenance', amount: 50 },
    { id: 'OT-002', employee_name: 'Jane Smith', date: '2026-04-02', hours: 4, type: 'Rest Day', status: 'Pending', reason: 'Year-end Closing', amount: 120 },
    { id: 'OT-003', employee_name: 'Mike Johnson', date: '2026-04-03', hours: 8, type: 'Holiday', status: 'Approved', reason: 'Emergency Support', amount: 320 },
    { id: 'OT-004', employee_name: 'Sarah Wilson', date: '2026-04-04', hours: 1, type: 'Regular', status: 'Rejected', reason: 'Personal work', amount: 25 },
    { id: 'OT-005', employee_name: 'Chris Brown', date: '2026-04-05', hours: 3, type: 'Rest Day', status: 'Pending', reason: 'Stock Take', amount: 90 },
];

const Overtime = () => {
    const [activeTab, setActiveTab] = useState('all');

    const filteredRecords = useMemo(() => {
        if (activeTab === 'all') return MOCK_OVERTIME;
        return MOCK_OVERTIME.filter(r => r.type === activeTab);
    }, [activeTab]);

    const stats = useMemo(() => {
        const totalHours = MOCK_OVERTIME.reduce((acc, curr) => acc + curr.hours, 0);
        const pendingCount = MOCK_OVERTIME.filter(r => r.status === 'Pending').length;
        const totalAmount = MOCK_OVERTIME.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        return { totalHours, pendingCount, totalAmount };
    }, []);

    return (
        <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Overtime Management
                    </h1>
                    <p className="text-muted-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80">
                        Monitor and approve employee extra hours
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <span>Export Report</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative overflow-hidden group p-6 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:border-secondary/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-12 h-12 text-secondary" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Total OT Hours</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold tracking-tight">{stats.totalHours}</h3>
                            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden group p-6 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:border-amber-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-12 h-12 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Pending Requests</p>
                        <h3 className="text-3xl font-bold tracking-tight text-amber-500">{stats.pendingCount}</h3>
                    </div>
                </div>

                <div className="relative overflow-hidden group p-6 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:border-blue-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Estimated OT Cost</p>
                        <h3 className="text-3xl font-bold tracking-tight">${stats.totalAmount.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="space-y-6">
                <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <TabsList className="bg-transparent h-fit p-0 gap-2 flex-wrap">
                            <TabsTrigger value="all" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                All Overtime
                            </TabsTrigger>
                            <TabsTrigger value="Regular" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                Regular (1.25x)
                            </TabsTrigger>
                            <TabsTrigger value="Rest Day" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                Rest Day (1.30x)
                            </TabsTrigger>
                            <TabsTrigger value="Holiday" className="px-6 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                Holiday (2.00x)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        <th className="px-6 py-5">Employee</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5">Hours</th>
                                        <th className="px-6 py-5">Type</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Estimated Amount</th>
                                        <th className="px-6 py-5 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/1 transition-all duration-300">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                                                        {record.employee_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">{record.employee_name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{record.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold">{record.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black italic">{record.hours}h</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                                                    record.type === 'Regular' && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                                                    record.type === 'Rest Day' && "bg-purple-500/10 text-purple-500 border border-purple-500/20",
                                                    record.type === 'Holiday' && "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                )}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {record.status === 'Approved' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                    {record.status === 'Rejected' && <XCircle className="w-4 h-4 text-rose-500" />}
                                                    {record.status === 'Pending' && <Clock className="w-4 h-4 text-amber-500" />}
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        record.status === 'Approved' && "text-green-500",
                                                        record.status === 'Rejected' && "text-rose-500",
                                                        record.status === 'Pending' && "text-amber-500"
                                                    )}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold">${record.amount?.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-muted-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Tabs>
            </section>
        </div>
    );
};

export default Overtime;