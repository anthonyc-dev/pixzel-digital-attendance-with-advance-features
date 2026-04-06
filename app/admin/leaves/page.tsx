'use client';

import React, { useState } from 'react';
import {
    CalendarDays,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaveRequest {
    id: number;
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    created_at: string;
}

const staticLeaves: LeaveRequest[] = [
    {
        id: 1,
        employee_name: 'John Doe',
        leave_type: 'Sick Leave',
        start_date: '2026-04-10',
        end_date: '2026-04-12',
        status: 'pending',
        reason: 'Feeling unwell',
        created_at: '2026-04-06',
    },
    {
        id: 2,
        employee_name: 'Jane Smith',
        leave_type: 'Vacation Leave',
        start_date: '2026-04-15',
        end_date: '2026-04-20',
        status: 'approved',
        reason: 'Family vacation',
        created_at: '2026-04-01',
    },
    {
        id: 3,
        employee_name: 'Mike Johnson',
        leave_type: 'Personal Leave',
        start_date: '2026-04-08',
        end_date: '2026-04-08',
        status: 'rejected',
        reason: 'Personal errands',
        created_at: '2026-04-05',
    },
    {
        id: 4,
        employee_name: 'Sarah Williams',
        leave_type: 'Maternity Leave',
        start_date: '2026-05-01',
        end_date: '2026-07-30',
        status: 'pending',
        reason: 'Maternity leave',
        created_at: '2026-04-06',
    },
];

console.log('Static Leaves Data:', staticLeaves);

const LeavesPage = () => {
    const [leaves] = useState<LeaveRequest[]>(staticLeaves);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const filteredLeaves = leaves.filter((leave) => {
        const matchesSearch = leave.employee_name.toLowerCase().includes(search.toLowerCase()) ||
            leave.leave_type.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || leave.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
            case 'rejected':
                return <XCircle className="w-3.5 h-3.5 text-red-500" />;
            default:
                return <Clock className="w-3.5 h-3.5 text-amber-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'rejected':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            default:
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };
    
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Leaves</h1>
                    </div>
                    <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                        Manage employee leave requests and approvals
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Request Leave</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Requests', value: leaves.length, color: 'text-secondary', bg: 'bg-secondary/10' },
                    { title: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { title: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { title: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: 'text-red-500', bg: 'bg-red-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                                <CalendarDays className={cn('w-4 h-4', stat.color)} />
                            </div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{stat.title}</div>
                        </div>
                        <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-secondary" />
                        <h2 className="text-sm font-bold tracking-tight text-foreground">Leave Requests</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all w-48"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as typeof filter)}
                                className="pl-9 pr-8 py-2 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">Employee</th>
                                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">Leave Type</th>
                                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">Start Date</th>
                                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">End Date</th>
                                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">Status</th>
                                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">Reason</th>
                                <th className="text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 px-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map((leave) => (
                                <tr key={leave.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-2">
                                        <span className="text-xs font-bold text-foreground">{leave.employee_name}</span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="text-xs text-muted-foreground">{leave.leave_type}</span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="text-xs text-muted-foreground">{leave.start_date}</span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="text-xs text-muted-foreground">{leave.end_date}</span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border', getStatusBadge(leave.status))}>
                                            {getStatusIcon(leave.status)}
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="text-xs text-muted-foreground line-clamp-1">{leave.reason}</span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLeaves.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                        <CalendarDays className="w-8 h-8" />
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2">No leaves found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeavesPage;
