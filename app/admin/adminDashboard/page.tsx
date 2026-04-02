'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Download, SlidersHorizontal, CalendarDays, CheckCircle2, Clock3, Umbrella, UserX, ArrowUpRight } from 'lucide-react';
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

const AttendancePage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployers = async () => {
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
        fetchEmployers();
    }, []);


    const stats = [
        { title: 'Present Today', value: employees.filter(e => e.status === 'active').length.toString().padStart(2, '0') || '00', sub: `${employees.length} People Total`, icon: CheckCircle2, iconColor: 'text-green-400', bgColor: 'bg-green-400/5', borderColor: 'border-green-400/10' },
        { title: 'Late Entry', value: employees.filter(e => e.status === 'late').length.toString().padStart(2, '0') || '00', sub: 'People on Time', icon: Clock3, iconColor: 'text-orange-400', bgColor: 'bg-orange-400/5', borderColor: 'border-orange-400/10' },
        { title: 'On Leave', value: employees.filter(e => e.status === 'leave').length.toString().padStart(2, '0') || '00', sub: 'Approved Leave', icon: Umbrella, iconColor: 'text-blue-400', bgColor: 'bg-blue-400/5', borderColor: 'border-blue-400/10' },
        { title: 'Absent', value: employees.filter(e => e.status === 'absent').length.toString().padStart(2, '0') || '00', sub: 'Without Informing', icon: UserX, iconColor: 'text-red-400', bgColor: 'bg-red-400/5', borderColor: 'border-red-400/10' },
    ];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'late': return 'Late';
            case 'leave': return 'Leave';
            case 'absent': return 'Absent';
            default: return 'Active';
        }
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return days;
    };

    const days = getLast7Days();
    return (
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl animate-in fade-in duration-200 ease-out pb-4 sm:pb-6 lg:pb-10">

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
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 animate-pulse flex flex-col gap-3 sm:gap-4 lg:gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 sm:w-12 h-12 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-white/10" />
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-10 w-16 bg-gray-100 dark:bg-white/10 rounded-lg" />
                                    <div className="h-4 w-24 bg-gray-50 dark:bg-white/5 rounded-md" />
                                    <div className="h-2 w-20 bg-gray-50/50 dark:bg-white/5 rounded-sm" />
                                </div>
                            </div>
                        ))
                    ) : (
                        stats.map((stat) => (
                            <div key={stat.title} className={cn(
                                "p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl transition-all group flex flex-col gap-3 sm:gap-4 lg:gap-6 relative overflow-hidden",
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
                        ))
                    )}
                </section>

                {/* Table Area */}
                <section className="flex flex-col gap-4 sm:gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-start md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                                {['Leave', 'Absent', 'Active'].map(f => (
                                    <span key={f} className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-white/5 text-[9px] sm:text-[10px] font-black text-foreground/50 uppercase tracking-widest rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-1 sm:gap-2 hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-foreground cursor-pointer transition-all">
                                        {f} <span className="opacity-30">×</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-foreground transition-all shadow-sm group">
                                <SlidersHorizontal className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="hidden sm:inline">Filter</span> <span className="text-secondary ml-1 bg-secondary/10 px-1.5 py-0.5 rounded text-[8px]">03</span>
                            </button>
                            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-foreground transition-all shadow-sm">
                                <CalendarDays className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-secondary" />
                                <span className="hidden sm:inline">08. August 2025</span>
                                <span className="sm:hidden">Aug 08</span>
                            </button>
                        </div>
                    </div>

                    {/* Attendance Table Panel */}
                    <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl overflow-x-auto">
                        {loading ? (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                                        <th className="p-4 sm:p-5 md:p-7 w-64"><div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" /></th>
                                        {[...Array(7)].map((_, i) => (
                                            <th key={i} className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5"><div className="h-3 w-10 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse mx-auto" /></th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="p-4 sm:p-5 md:p-7">
                                                <div className="flex items-center gap-3 sm:gap-5">
                                                    <div className="w-10 h-10 sm:w-12 h-12 md:w-14 h-14 bg-gray-200 dark:bg-white/10 rounded-xl sm:rounded-2xl animate-pulse" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
                                                        <div className="h-2 w-20 bg-gray-100 dark:bg-white/5 rounded-sm animate-pulse" />
                                                    </div>
                                                </div>
                                            </td>
                                            {[...Array(7)].map((_, j) => (
                                                <td key={j} className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5">
                                                    <div className="h-8 w-24 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse mx-auto" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : employees.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No employees found</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                                        <th className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">Employee Info</th>
                                        {days.map((day, idx) => (
                                            <th key={idx} className="p-4 sm:p-5 md:p-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 border-l border-gray-100 dark:border-white/5 text-center">{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {employees.map((emp, i) => (
                                        <tr key={emp.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                                            <td className="p-4 sm:p-5 md:p-7">
                                                <div className="flex items-center gap-3 sm:gap-5">
                                                    <div className="relative">
                                                        {emp.image ? (
                                                            <Image src={emp.image} alt={emp.employer_name} width={56} height={56} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all duration-500 border border-gray-100 dark:border-white/10 shadow-lg group-hover:shadow-secondary/20" unoptimized />
                                                        ) : (
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-black text-gray-500">
                                                                {emp.employer_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "absolute -bottom-0.5 -right-0.5 w-3 sm:w-4 h-3 sm:h-4 border-2 border-white dark:border-black rounded-full shadow-sm",
                                                            emp.status === 'active' ? 'bg-green-500' :
                                                                emp.status === 'late' ? 'bg-orange-500' :
                                                                    emp.status === 'leave' ? 'bg-purple-500' :
                                                                        emp.status === 'absent' ? 'bg-red-500' : 'bg-green-500'
                                                        )} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs sm:text-base font-black text-foreground leading-none tracking-tight group-hover:text-secondary transition-colors">{emp.employer_name}</span>
                                                        <span className="text-[9px] sm:text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest hidden sm:block">{emp.employer_position || 'Employee'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {days.map((_, j) => (
                                                <td key={j} className="p-4 sm:p-5 md:p-7 border-l border-gray-100 dark:border-white/5 relative group/cell">
                                                    <span className="absolute top-2 sm:top-3 md:top-4 right-3 sm:right-4 md:right-5 text-[9px] sm:text-[10px] font-black text-gray-200 dark:text-gray-800 group-hover/cell:text-gray-400 dark:group-hover/cell:text-gray-600 transition-colors">{j + 1}</span>
                                                    <div className={cn(
                                                        "mt-4 sm:mt-5 mx-auto flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ring-1 ring-inset",
                                                        emp.status === 'active' && "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-600/20 dark:ring-green-400/20",
                                                        emp.status === 'late' && "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20",
                                                        emp.status === 'leave' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-400/20",
                                                        emp.status === 'absent' && "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-600/20 dark:ring-red-400/20"
                                                    )}>
                                                        {emp.status === 'active' && <CheckCircle2 className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                        {emp.status === 'late' && <Clock3 className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                        {emp.status === 'leave' && <Umbrella className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                        {emp.status === 'absent' && <UserX className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />}
                                                        <span className="hidden sm:inline">{getStatusLabel(emp.status)}</span>
                                                        <span className="sm:hidden">{getStatusLabel(emp.status).slice(0, 3)}</span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

            </div>
    );
};

export default AttendancePage;