'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
    ClipboardCheck,
    Search,
    Filter,
    Calendar as CalendarIcon,
    Download,
    ChevronRight,
    Clock,
    ArrowUpRight,
    TrendingUp,
    UserCheck,
    UserMinus,
    MoreVertical,
    FileSpreadsheet
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Employee {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    status: string;
    image: string | null;
    created_at: string;
}

interface AttendanceRecord {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    status: string;
    created_at: string;
}

const DTRPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch employers
                const empRes = await fetch('/api/registration');
                const empData = await empRes.json();
                setEmployees(empData.data || []);

                // Fetch attendance records
                const attRes = await fetch('/api/attendance');
                const attData = await attRes.json();
                setAttendance(attData || []);
            } catch (error) {
                console.error('Failed to fetch DTR data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.employer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employer_position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { title: 'Total Handled', value: employees.length.toString().padStart(2, '0'), icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'On Time Rate', value: '94%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Late Entries', value: attendance.filter(a => a.status === 'late').length.toString().padStart(2, '0'), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Absences', value: '00', icon: UserMinus, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">Daily Time Record</h1>
                        <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80 flex items-center gap-2">
                            Comprehensive attendance activity logs
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all group">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-green-500 transition-transform group-hover:scale-110" />
                            <span>CSV</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all">
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                        </button>
                    </div>
                </header>

                {/* Stats Summary */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn("p-2 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-secondary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </div>
                            <div className="text-2xl font-black text-foreground tabular-nums mb-0.5 tracking-tighter">{stat.value}</div>
                            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{stat.title}</div>
                        </div>
                    ))}
                </section>

                {/* Main Content Area */}
                <div className="flex flex-col gap-6">
                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="relative group flex-1 min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by Employer Name or Position..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                                <Filter className="w-3.5 h-3.5 text-secondary" />
                                <span>Filters</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                                <CalendarIcon className="w-3.5 h-3.5 text-secondary" />
                                <span>{format(new Date(), 'MMMM yyyy')}</span>
                            </button>
                        </div>
                    </div>

                    {/* DTR Table Table */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-white/10 border-b border-gray-100 dark:border-white/5">
                                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Employer Information</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Date & Time</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status Type</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Log</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td className="p-4"><div className="h-14 bg-gray-100 dark:bg-white/10 rounded-2xl animate-pulse w-48" /></td>
                                                <td className="p-4"><div className="h-6 bg-gray-50 dark:bg-white/5 rounded-lg animate-pulse w-32" /></td>
                                                <td className="p-4"><div className="h-10 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse w-24" /></td>
                                                <td className="p-4"><div className="h-6 bg-gray-50 dark:bg-white/5 rounded-lg animate-pulse w-40" /></td>
                                                <td className="p-4 text-center"><div className="h-10 w-10 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mx-auto" /></td>
                                            </tr>
                                        ))
                                    ) : filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-40">
                                                    <UserMinus className="w-16 h-16" />
                                                    <p className="font-black uppercase tracking-widest text-xs">No Records Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((emp) => {
                                            // Find recent logs for this employee
                                            const userLogs = attendance.filter(a => a.employer_id === emp.employer_id);
                                            const latestLog = userLogs[0]; // Already ordered by created_at desc in API

                                            return (
                                                <tr key={emp.id} className="group hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                {emp.image ? (
                                                                    <Image src={emp.image} alt={emp.employer_name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover border border-white dark:border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-black text-secondary">
                                                                        {emp.employer_name.charAt(0)}
                                                                    </div>
                                                                )}
                                                        </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-lg tracking-tight group-hover:text-secondary transition-colors">{emp.employer_name}</span>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{emp.employer_position}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-foreground/80">{latestLog ? format(new Date(latestLog.created_at), 'MMM dd, yyyy') : 'No Records'}</span>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{latestLog ? format(new Date(latestLog.created_at), 'hh:mm aa') : '--:--'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ring-1 ring-inset",
                                                            (latestLog?.status || emp.status) === 'active' ? "bg-green-500/10 text-green-600 ring-green-600/20 border-green-600/30" :
                                                                (latestLog?.status || emp.status) === 'late' ? "bg-orange-500/10 text-orange-600 ring-orange-600/20 border-orange-600/30" :
                                                                    "bg-red-500/10 text-red-600 ring-red-600/20 border-red-600/30"
                                                        )}>
                                                            <div className={cn("w-2 h-2 rounded-full",
                                                                (latestLog?.status || emp.status) === 'active' ? "bg-green-600" :
                                                                    (latestLog?.status || emp.status) === 'late' ? "bg-orange-600" : "bg-red-600"
                                                            )} />
                                                            <span>{latestLog?.status || emp.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs font-black text-foreground/60">
                                                                <Clock className="w-3 h-3 text-secondary" />
                                                                <span>{userLogs.length} Records this Month</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                                <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min(userLogs.length * 10, 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-secondary hover:text-white rounded-2xl transition-all border border-gray-100 dark:border-white/5 text-gray-400 group/btn">
                                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default DTRPage;
