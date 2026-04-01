'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Download, Search, SlidersHorizontal, CalendarDays, MoreHorizontal, CheckCircle2, Clock3, Umbrella, UserX, ArrowUpRight, Users } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
    day: string;
    hours: string;
    status: 'active' | 'late' | 'leave' | 'absent' | 'empty';
    icon: 'check' | 'clock' | 'smile' | 'x' | null;
}

interface Employee {
    id: string;
    employer_id?: string;
    employer_name: string;
    employer_position?: string;
    name?: string;
    role?: string;
    avatar?: string;
    attendance: AttendanceRecord[];
}

const initialStats = [
    { title: 'Present Today', value: '-', sub: 'People Present', icon: CheckCircle2, iconColor: 'text-green-400', bgColor: 'bg-green-400/5', borderColor: 'border-green-400/10' },
    { title: 'Late Entry', value: '-', sub: 'Late Arrivals', icon: Clock3, iconColor: 'text-orange-400', bgColor: 'bg-orange-400/5', borderColor: 'border-orange-400/10' },
    { title: 'On Leave', value: '-', sub: 'Approved Leave', icon: Umbrella, iconColor: 'text-blue-400', bgColor: 'bg-blue-400/5', borderColor: 'border-blue-400/10' },
    { title: 'Absent', value: '-', sub: 'Without Informing', icon: UserX, iconColor: 'text-red-400', bgColor: 'bg-red-400/5', borderColor: 'border-red-400/10' },
];

const initialEmployees = [
    {
        name: 'Dianne Russell', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=dianne',
        attendance: [
            { day: 'Sun', hours: '8 Hours', status: 'active', icon: 'check' },
            { day: 'Mon', hours: '4h 36m', status: 'late', icon: 'clock' },
            { day: 'Tue', hours: 'Leave', status: 'leave', icon: 'smile' },
            { day: 'Wed', hours: '8h 39m', status: 'active', icon: 'check' },
            { day: 'Thu', hours: 'Active', status: 'active', icon: null },
            { day: 'Fri', hours: '', status: 'empty' },
            { day: 'Sat', hours: '', status: 'empty' },
        ]
    },
    {
        name: 'Bessie Cooper', role: 'Product Designer', avatar: 'https://i.pravatar.cc/150?u=bessie',
        attendance: [
            { day: 'Sun', hours: '6h 24m', status: 'late', icon: 'clock' },
            { day: 'Mon', hours: '8 Hours', status: 'active', icon: 'check' },
            { day: 'Tue', hours: '8 Hours', status: 'active', icon: 'check' },
            { day: 'Wed', hours: 'Absent', status: 'absent', icon: 'x' },
            { day: 'Thu', hours: 'Active', status: 'active', icon: null },
            { day: 'Fri', hours: '', status: 'empty' },
            { day: 'Sat', hours: '', status: 'empty' },
        ]
    },
    {
        name: 'Brooklyn Jones', role: 'Marketing Officer', avatar: 'https://i.pravatar.cc/150?u=brooklyn',
        attendance: [
            { day: 'Sun', hours: '8 Hours', status: 'active', icon: 'check' },
            { day: 'Mon', hours: '8h 12m', status: 'active', icon: 'check' },
            { day: 'Tue', hours: '3h 45m', status: 'late', icon: 'clock' },
            { day: 'Wed', hours: '8 Hours', status: 'active', icon: 'check' },
            { day: 'Thu', hours: 'Leave', status: 'leave', icon: 'smile' },
            { day: 'Fri', hours: '', status: 'empty' },
            { day: 'Sat', hours: '', status: 'empty' },
        ]
    },
    {
        name: 'Eleanor Pena', role: 'Content Writer', avatar: 'https://i.pravatar.cc/150?u=eleanor',
        attendance: [
            { day: 'Sun', hours: '8h 15m', status: 'active', icon: 'check' },
            { day: 'Mon', hours: '8 Hours', status: 'active', icon: 'check' },
            { day: 'Tue', hours: '8h 23m', status: 'active', icon: 'check' },
            { day: 'Wed', hours: '7h 24m', status: 'late', icon: 'clock' },
            { day: 'Thu', hours: 'Active', status: 'active', icon: null },
            { day: 'Fri', hours: '', status: 'empty' },
            { day: 'Sat', hours: '', status: 'empty' },
        ]
    }
];

const AttendancePage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(initialStats);
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/employers');
                if (response.ok) {
                    const result = await response.json();
                    const employerData = result.data || [];
                    
                    const present = employerData.filter((e: any) => e.status === 'present').length;
                    const onLeave = employerData.filter((e: any) => e.status === 'leave').length;
                    const absent = employerData.filter((e: any) => e.status === 'absent').length;
                    
                    setStats([
                        { ...initialStats[0], value: String(present) },
                        { ...initialStats[1], value: '-' },
                        { ...initialStats[2], value: String(onLeave) },
                        { ...initialStats[3], value: String(absent) },
                    ]);
                    
                    setEmployees(employerData.map((e: any) => ({
                        id: e.id,
                        employer_id: e.employer_id,
                        employer_name: e.employer_name,
                        employer_position: e.employer_position,
                        attendance: [],
                    })));
                }
            } catch (e) {
                console.error('Failed to fetch dashboard data:', e);
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <Layout>
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl animate-in fade-in duration-500 ease-out pb-4 sm:pb-6 lg:pb-10">

                {/* Page Title */}
                <header className="flex flex-wrap items-start sm:items-end justify-between gap-4">
                    <div className="space-y-1 sm:space-y-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-foreground">Employee Attendance</h1>
                        <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">Analyse attendance records of employee</p>
                    </div>
                    <button className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-secondary text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-xl shadow-secondary/20 hover:scale-[1.03] active:scale-[0.97] transition-all w-fit">
                        <Download className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>Download</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className={cn(
                            "p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] transition-all group flex flex-col gap-3 sm:gap-4 lg:gap-6 relative overflow-hidden",
                            "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-white/[0.08]"
                        )}>
                            <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-[0.03] group-hover:opacity-[0.08] dark:opacity-5 dark:group-hover:opacity-10 transition-opacity">
                                <stat.icon className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl", stat.bgColor, stat.borderColor, "border")}>
                                    <stat.icon className={cn("w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6", stat.iconColor)} />
                                </div>
                                <div className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer border border-gray-100 dark:border-white/5">
                                    <ArrowUpRight className="w-3 sm:w-4 h-3 sm:h-4" />
                                </div>
                            </div>
                            <div className="z-10 relative">
                                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-1 sm:mb-2 tracking-tighter tabular-nums drop-shadow-sm">{stat.value}</div>
                                <div className="text-xs sm:text-sm font-black text-foreground/80 group-hover:text-secondary transition-colors tracking-tight uppercase">{stat.title}</div>
                                <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-extrabold uppercase tracking-widest mt-0.5">{stat.sub}</div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Table Area */}
                <section className="flex flex-col gap-4 sm:gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-start md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                            <div className="relative group w-full sm:w-auto">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-gray-500 dark:text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-4 text-[10px] sm:text-[11px] uppercase tracking-widest font-black text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all w-full sm:w-64 md:w-80 shadow-sm"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl sm:rounded-[1.5rem]">
                                {['Leave', 'Absent', 'Active'].map(f => (
                                    <span key={f} className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-white/5 text-[9px] sm:text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-white/5 flex items-center gap-1 sm:gap-2 hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white cursor-pointer transition-all">
                                        {f} <span className="opacity-30">×</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm group">
                                <SlidersHorizontal className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="hidden sm:inline">Filter</span> <span className="text-secondary ml-1 bg-secondary/10 px-1.5 py-0.5 rounded text-[8px]">03</span>
                            </button>
                            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm">
                                <CalendarDays className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-secondary" />
                                <span className="hidden sm:inline">08. August 2025</span>
                                <span className="sm:hidden">Aug 08</span>
                            </button>
                        </div>
                    </div>

                    {/* Attendance Table Panel */}
                    <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-xl dark:shadow-2xl overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                                    <th className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Employee Info</th>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <th key={day} className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 text-center">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3, 4].map((i) => (
                                            <tr key={i}>
                                                <td className="p-4 sm:p-5 md:p-7">
                                                    <div className="flex items-center gap-3 sm:gap-5">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse" />
                                                        <div className="flex flex-col gap-2">
                                                            <div className="h-4 w-32 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                                                            <div className="h-3 w-20 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                                                        </div>
                                                    </div>
                                                </td>
                                                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                                                    <td key={j} className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                                                        <div className="mt-4 sm:mt-5 mx-auto h-[28px] sm:h-[32px] w-[50px] sm:w-[60px] bg-gray-200 dark:bg-white/5 rounded-lg sm:rounded-xl animate-pulse" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </>
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Users className="w-8 h-8 opacity-50" />
                                                <span className="text-sm font-bold">No attendance records found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp, i) => (
                                        <tr key={emp.employer_name || emp.name || i} className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                                            <td className="p-4 sm:p-5 md:p-7">
                                                <div className="flex items-center gap-3 sm:gap-5">
                                                    <div className="relative">
                                                        <Image src={emp.avatar || `https://i.pravatar.cc/150?u=${emp.employer_id || i}`} alt={emp.employer_name || emp.name || ''} width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500 border border-gray-100 dark:border-white/10 shadow-lg group-hover:shadow-secondary/20" />
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 sm:w-4 h-3 sm:h-4 bg-green-500 border-2 border-white dark:border-black rounded-full shadow-sm" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs sm:text-base font-black text-foreground leading-none tracking-tight group-hover:text-secondary transition-colors">{emp.employer_name || emp.name}</span>
                                                        <span className="text-[9px] sm:text-[10px] font-black text-gray-500 dark:text-gray-600 uppercase tracking-widest hidden sm:block">{emp.employer_position || emp.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {emp.attendance.map((att, j) => (
                                                <td key={j} className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5 relative group/cell">
                                                    <span className="absolute top-2 sm:top-3 md:top-4 right-3 sm:right-4 md:right-5 text-[9px] sm:text-[10px] font-black text-gray-400 dark:text-gray-800 group-hover/cell:text-gray-600 dark:group-hover/cell:text-gray-600 transition-colors">{1 + j + (i * 2) % 31}</span>
                                                    {att.status !== 'empty' ? (
                                                        <div className={cn(
                                                            "mt-4 sm:mt-5 mx-auto flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ring-1 ring-inset",
                                                            att.status === 'active' && "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-600/20 dark:ring-green-400/20",
                                                            att.status === 'late' && "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20",
                                                            att.status === 'leave' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-400/20",
                                                            att.status === 'absent' && "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-600/20 dark:ring-red-400/20"
                                                        )}>
                                                            {att.icon === 'check' && <CheckCircle2 className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                            {att.icon === 'clock' && <Clock3 className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                            {att.icon === 'smile' && <Umbrella className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                            {att.icon === 'x' && <UserX className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                            <span className="hidden sm:inline">{att.hours}</span>
                                                            <span className="sm:hidden">{att.hours?.split(' ')[0]}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 sm:mt-5 h-[24px] sm:h-[28px] w-full bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.05)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.02)_1px,_transparent_0)] bg-[size:8px_8px] sm:bg-[size:10px_10px]" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </Layout>
    );
};

export default AttendancePage;
