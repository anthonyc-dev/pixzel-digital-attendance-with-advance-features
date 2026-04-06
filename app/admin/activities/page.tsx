'use client';

import React, { useEffect, useState } from 'react';
import { 
    Download, 
    CheckCircle2, 
    Clock3, 
    ArrowUpRight, 
    History as LucideHistory, 
    AlertCircle, 
    LogIn, 
    LogOut, 
    Terminal,
    Search
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';

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
    employer_registration_id: string;
    type: 'time_in' | 'time_out';
    status: string;
    timestamp: string;
    employer_registration?: {
        employer_id: string;
        employer_name: string;
        employer_position: string;
        image: string;
    };
}

const ActivitiesPage = () => {
    const [, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, attRes] = await Promise.all([
                    fetch(`${ENV.API_URL}/registration`),
                    fetch(`${ENV.API_URL}/attendance`)
                ]);
                
                if (empRes.ok) {
                    const empData = await empRes.json();
                    setEmployees(empData.data || []);
                }
                
                if (attRes.ok) {
                    const attData = await attRes.json();
                    setAttendance(attData || []);
                }
            } catch (e) {
                console.error('Failed to fetch data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const recentLogs = [...attendance]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50);

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const filteredRecentLogs = normalizedSearchQuery
        ? recentLogs.filter((log) =>
            (log.employer_registration?.employer_name || '')
                .toLowerCase()
                .includes(normalizedSearchQuery)
        )
        : recentLogs;

    const stats = [
        { title: 'Total Logs', value: attendance.length.toString().padStart(2, '0'), sub: 'All Time Activity', icon: LucideHistory, iconColor: 'text-blue-400', bgColor: 'bg-blue-400/5', borderColor: 'border-blue-400/10' },
        { title: 'In Today', value: attendance.filter(a => a.type === 'time_in' && a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString().padStart(2, '0'), sub: 'Entries Today', icon: CheckCircle2, iconColor: 'text-green-400', bgColor: 'bg-green-400/5', borderColor: 'border-green-400/10' },
        { title: 'Out Today', value: attendance.filter(a => a.type === 'time_out' && a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString().padStart(2, '0'), sub: 'Exits Today', icon: Clock3, iconColor: 'text-orange-400', bgColor: 'bg-orange-400/5', borderColor: 'border-orange-400/10' },
        { title: 'Late Today', value: attendance.filter(a => a.status === 'late' && a.type === 'time_in' && a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString().padStart(2, '0'), sub: 'After 9:15 AM', icon: AlertCircle, iconColor: 'text-red-400', bgColor: 'bg-red-400/5', borderColor: 'border-red-400/10' },
    ];

    return (
        <div className="flex flex-col gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">

            {/* Page Title */}
            <header className="flex flex-wrap items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Activity Stream
                    </h1>
                    <p className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] leading-none opacity-70">Real-time attendance activity monitor</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white border border-secondary/20 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all duration-300">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export History</span>
                </button>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 animate-pulse space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10" />
                                <div className="space-y-1.5">
                                    <div className="h-2 w-16 bg-gray-100 dark:bg-white/10 rounded" />
                                    <div className="h-2 w-10 bg-gray-50 dark:bg-white/5 rounded" />
                                </div>
                            </div>
                            <div className="h-8 w-12 bg-gray-100 dark:bg-white/10 rounded-lg" />
                        </div>
                    ))
                ) : (
                    stats.map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group hover:scale-[1.01] transition-all relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("p-2.5 rounded-xl", stat.bgColor, stat.borderColor, "border")}>
                                    <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.title}</div>
                                    <div className="text-[8px] font-bold text-emerald-500 flex items-center gap-1">
                                        <ArrowUpRight className="w-2 h-2" />
                                        {stat.sub}
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight flex items-center gap-1">
                                {stat.value}
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Search Bar */}
            <section className="w-full">
                <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search employee name..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-secondary dark:border-white/10 dark:bg-white/2"
                        aria-label="Search activity logs"
                    />
                </div>
            </section>

            {/* Logs Table Area */}
            <section className="flex flex-col gap-3">
                <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/5">
                                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Log Timestamp</th>
                                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Employee Identification</th>
                                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Activity Type</th>
                                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Status</th>
                                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Device/Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="p-4" colSpan={5}><div className="h-8 w-full bg-gray-50 dark:bg-white/[0.01] rounded animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : filteredRecentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                                            <LucideHistory className="w-8 h-8 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-[9px]">
                                                {normalizedSearchQuery ? 'No matching activity logs found' : 'No activity logs recorded yet'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecentLogs.map((log) => (
                                        <tr key={log.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-default">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-foreground/90">{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative">
                                                        {log.employer_registration?.image ? (
                                                            <Image src={log.employer_registration.image} alt="" width={32} height={32} className="w-8 h-8 rounded-lg object-cover border border-white dark:border-white/10 shadow-sm" unoptimized />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-[10px] font-bold text-secondary uppercase">
                                                                {log.employer_registration?.employer_name?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white dark:border-[#09090b]",
                                                            log.status === 'present' || log.status === 'on_time' ? "bg-emerald-500" : "bg-amber-500"
                                                        )} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-foreground leading-none tracking-tight group-hover:text-secondary transition-colors">{log.employer_registration?.employer_name || 'System User'}</span>
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">{log.employer_registration?.employer_position || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest",
                                                        log.type === 'time_in' ? "bg-blue-500/5 text-blue-500/80 border border-blue-500/10" : "bg-orange-500/5 text-orange-500/80 border border-orange-500/10"
                                                    )}>
                                                        {log.type === 'time_in' ? <LogIn className="w-2.5 h-2.5" /> : <LogOut className="w-2.5 h-2.5" />}
                                                        {log.type.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                                                        (log.status === 'present' || log.status === 'on_time') ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                                                    )}>
                                                        <span className="w-1 h-1 rounded-full bg-current" />
                                                        {log.status === 'on_time' ? 'present' : log.status}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center gap-1.5 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                                                    <Terminal className="w-2.5 h-2.5" />
                                                    <span className="text-[8px] font-bold uppercase tracking-widest whitespace-nowrap">Gate Terminal 01</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="text-[8px] text-center text-muted-foreground/40 font-bold uppercase tracking-[0.3em] py-2">
                    End of recent activity stream
                </p>
            </section>
        </div>
    );
};

export default ActivitiesPage;
