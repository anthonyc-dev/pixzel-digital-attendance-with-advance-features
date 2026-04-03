import React from 'react';
import Layout from '@/components/Layout';
import { Download, Search, SlidersHorizontal, CalendarDays, CheckCircle2, Clock3, Umbrella, UserX, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const stats = [
    { title: 'Present Today', value: '40', sub: '124 People Remaining', icon: CheckCircle2, iconColor: 'text-green-400', bgColor: 'bg-green-400/5', borderColor: 'border-green-400/10' },
    { title: 'Late Entry', value: '26', sub: '12 People are on Time', icon: Clock3, iconColor: 'text-orange-400', bgColor: 'bg-orange-400/5', borderColor: 'border-orange-400/10' },
    { title: 'On Leave', value: '04', sub: 'Approved Leave', icon: Umbrella, iconColor: 'text-blue-400', bgColor: 'bg-blue-400/5', borderColor: 'border-blue-400/10' },
    { title: 'Absent', value: '01', sub: 'Without Informing', icon: UserX, iconColor: 'text-red-400', bgColor: 'bg-red-400/5', borderColor: 'border-red-400/10' },
];

const employees = [
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

const EmployeeDashboard = () => {
    return (
        <Layout>
            <div className="flex flex-col gap-8 w-full max-w-7xl animate-in fade-in slide-in-from-bottom duration-700">

                {/* Page Title */}
                <header className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-white">Employee Attendance</h1>
                        <p className="text-gray-500 text-sm font-black uppercase tracking-widest leading-none">Analyse attendance records of employee</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-4 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-secondary/30 hover:scale-[1.03] active:scale-[0.97] transition-all">
                        <Download className="w-4 h-4" />
                        <span>Download Reports</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className={cn("p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-white/10 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-black transition-all group flex flex-col gap-6 relative overflow-hidden")}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon className="w-16 h-16" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className={cn("p-3 rounded-2xl", stat.bgColor, stat.borderColor, "border")}>
                                    <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer ring-1 ring-white/5">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="z-10 relative">
                                <div className="text-5xl font-black text-white mb-2 tracking-tighter tabular-nums drop-shadow-md">{stat.value}</div>
                                <div className="text-sm font-black text-white group-hover:text-secondary transition-colors tracking-tight uppercase">{stat.title}</div>
                                <div className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest mt-0.5">{stat.sub}</div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Table Area */}
                <section className="mt-4 flex flex-col gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Search by name or role..."
                                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-5 text-[11px] uppercase tracking-widest font-black text-white focus:ring-1 focus:ring-secondary/40 focus:border-secondary/40 transition-all w-80 shadow-inner"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-[1.5rem]">
                                {['Leave', 'Absent', 'Active'].map(f => (
                                    <span key={f} className="px-4 py-2 bg-white/5 text-[9px] font-black text-white/50 uppercase tracking-widest rounded-xl shadow-sm border border-white/5 flex items-center gap-2 hover:bg-white/[0.08] hover:text-white cursor-pointer transition-all">
                                        {f} <span className="opacity-30">×</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all shadow-xl group">
                                <SlidersHorizontal className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                Filter Options <span className="text-secondary ml-1 bg-secondary/10 px-1.5 py-0.5 rounded">03</span>
                            </button>
                            <button className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all shadow-xl">
                                <CalendarDays className="w-3.5 h-3.5 text-secondary" />
                                08. August 2025
                            </button>
                        </div>
                    </div>

                    {/* Attendance Table Panel */}
                    <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.03] border-b border-white/5">
                                    <th className="p-7 text-[10px] font-black uppercase tracking-widest text-gray-600 w-80">Employee Info</th>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <th key={day} className="p-7 text-[10px] font-black uppercase tracking-widest text-gray-600 border-l border-white/5 text-center">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {employees.map((emp, i) => (
                                    <tr key={emp.name} className="group hover:bg-white/[0.03] transition-all">
                                        <td className="p-7">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <Image src={emp.avatar} alt={emp.name} width={50} height={50} className="rounded-lg grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/10 shadow-lg group-hover:shadow-secondary/20" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-sm" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-base font-black text-white leading-none tracking-tight group-hover:text-secondary transition-colors">{emp.name}</span>
                                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{emp.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {emp.attendance.map((att, j) => (
                                            <td key={j} className="p-7 border-l border-white/5 relative group/cell">
                                                <span className="absolute top-4 right-5 text-[10px] font-black text-gray-800 group-hover/cell:text-gray-600 transition-colors">{1 + j + (i * 2) % 31}</span>
                                                {att.status !== 'empty' ? (
                                                    <div className={cn(
                                                        "mt-5 mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ring-1 ring-inset",
                                                        att.status === 'active' && "bg-green-500/10 text-green-400 ring-green-400/20",
                                                        att.status === 'late' && "bg-orange-500/10 text-orange-400 ring-orange-400/20",
                                                        att.status === 'leave' && "bg-purple-500/10 text-purple-400 ring-purple-400/20",
                                                        att.status === 'absent' && "bg-red-500/10 text-red-400 ring-red-400/20"
                                                    )}>
                                                        {att.icon === 'check' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        {att.icon === 'clock' && <Clock3 className="w-3.5 h-3.5" />}
                                                        {att.icon === 'smile' && <Umbrella className="w-3.5 h-3.5" />}
                                                        {att.icon === 'x' && <UserX className="w-3.5 h-3.5" />}
                                                        {att.hours}
                                                    </div>
                                                ) : (
                                                    <div className="mt-5 h-[28px] w-full bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.02)_1px,_transparent_0)] bg-[size:10px_10px]" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </Layout>
    );
};

export default EmployeeDashboard;
