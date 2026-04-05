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
    Terminal 
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

    const stats = [
        { title: 'Total Logs', value: attendance.length.toString().padStart(2, '0'), sub: 'All Time Activity', icon: LucideHistory, iconColor: 'text-blue-400', bgColor: 'bg-blue-400/5', borderColor: 'border-blue-400/10' },
        { title: 'In Today', value: attendance.filter(a => a.type === 'time_in' && a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString().padStart(2, '0'), sub: 'Entries Today', icon: CheckCircle2, iconColor: 'text-green-400', bgColor: 'bg-green-400/5', borderColor: 'border-green-400/10' },
        { title: 'Out Today', value: attendance.filter(a => a.type === 'time_out' && a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString().padStart(2, '0'), sub: 'Exits Today', icon: Clock3, iconColor: 'text-orange-400', bgColor: 'bg-orange-400/5', borderColor: 'border-orange-400/10' },
        { title: 'Late Today', value: attendance.filter(a => a.status === 'late' && a.type === 'time_in' && a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString().padStart(2, '0'), sub: 'After 9:15 AM', icon: AlertCircle, iconColor: 'text-red-400', bgColor: 'bg-red-400/5', borderColor: 'border-red-400/10' },
    ];

    return (
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl animate-in fade-in duration-200 ease-out pb-4 sm:pb-6 lg:pb-10">

            {/* Page Title */}
            <header className="flex flex-wrap items-start sm:items-end justify-between gap-4">
                <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Activity Logs</h1>
                    <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">Real-time attendance activity stream</p>
                </div>
                <button className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-secondary text-white rounded-lg sm:rounded-xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] shadow-xl shadow-secondary/20 hover:scale-[1.03] active:scale-[0.97] transition-all w-fit">
                    <Download className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Export History</span>
                </button>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 animate-pulse flex flex-col gap-3 sm:gap-4 lg:gap-6">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 sm:w-12 h-12 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-white/10" />
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-10 w-16 bg-gray-100 dark:bg-white/10 rounded-lg" />
                                <div className="h-4 w-24 bg-gray-50 dark:bg-white/5 rounded-md" />
                            </div>
                        </div>
                    ))
                ) : (
                    stats.map((stat) => (
                        <div key={stat.title} className={cn(
                            "p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl transition-all group flex flex-col gap-3 sm:gap-4 lg:gap-6 relative overflow-hidden",
                            "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-white/[0.08]"
                        )}>
                            <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-[0.03] group-hover:opacity-[0.08] dark:opacity-5 dark:group-hover:opacity-10 transition-opacity">
                                <stat.icon className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className={cn("p-2 sm:p-3 rounded-lg sm:rounded-xl", stat.bgColor, stat.borderColor, "border")}>
                                    <stat.icon className={cn("w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6", stat.iconColor)} />
                                </div>
                                <div className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer border border-gray-100 dark:border-white/5">
                                    <ArrowUpRight className="w-3 sm:w-4 h-3 sm:h-4" />
                                </div>
                            </div>
                            <div className="z-10 relative">
                                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-1 sm:mb-2 tracking-tight tabular-nums drop-shadow-sm">{stat.value}</div>
                                <div className="text-xs sm:text-sm font-bold text-foreground/80 group-hover:text-secondary transition-colors tracking-tight uppercase">{stat.title}</div>
                                <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">{stat.sub}</div>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Logs Table Area */}
            <section className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        <LucideHistory className="w-5 h-5 text-secondary" />
                        Recent Activity Stream
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Live Feed
                        </div>
                    </div>
                </div>

                <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                                    <th className="p-4 sm:p-5 md:p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Timestamp</th>
                                    <th className="p-4 sm:p-5 md:p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Employee</th>
                                    <th className="p-4 sm:p-5 md:p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Event</th>
                                    <th className="p-4 sm:p-5 md:p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Status</th>
                                    <th className="p-4 sm:p-5 md:p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Location/Device</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="p-5"><div className="h-4 w-32 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                                            <td className="p-5 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 animate-pulse" />
                                                <div className="h-4 w-24 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
                                            </td>
                                            <td className="p-5" colSpan={3}><div className="h-4 w-full bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : recentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                                            <LucideHistory className="w-12 h-12 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No activity logs recorded yet</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log) => (
                                        <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                                            <td className="p-4 sm:p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5">
                                                <div className="flex items-center gap-3">
                                                    {log.employer_registration?.image ? (
                                                        <Image src={log.employer_registration.image} alt="" width={40} height={40} className="w-9 h-9 rounded-lg object-cover border border-white dark:border-white/10 shadow-sm" unoptimized />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary uppercase">
                                                            {log.employer_registration?.employer_name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-foreground leading-none tracking-tight">{log.employer_registration?.employer_name || 'Unknown Employee'}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{log.employer_registration?.employer_position || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset",
                                                    log.type === 'time_in' ? "bg-blue-500/10 text-blue-500 ring-blue-500/20" : "bg-orange-500/10 text-orange-500 ring-orange-500/20"
                                                )}>
                                                    {log.type === 'time_in' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                                                    {log.type.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                    (log.status === 'present' || log.status === 'on_time') ? "text-emerald-500" : "text-amber-500"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full bg-current", (log.status === 'present' || log.status === 'on_time') ? "animate-pulse" : "")} />
                                                    {log.status === 'on_time' ? 'present' : log.status}
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5">
                                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                                    <Terminal className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Digital Terminal #01</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ActivitiesPage;
