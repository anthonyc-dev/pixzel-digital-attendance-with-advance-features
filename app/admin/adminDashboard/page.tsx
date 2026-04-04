'use client';

import React, { useEffect, useState } from 'react';
import { 
    Users, 
    UserCheck, 
    UserMinus, 
    Clock, 
    TrendingUp, 
    Calendar,
    ChevronRight,
    Activity,
    Target
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

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
}

const AdminDashboard = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, attRes] = await Promise.all([
                    fetch('/api/registration'),
                    fetch('/api/attendance')
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
                console.error('Failed to fetch dashboard data:', e);
            }
        };
        fetchData();
    }, []);

    const getDynamicWeeklyData = () => {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(today) });

        return weekDays.map(day => {
            const dayAttendances = attendance.filter(a => 
                isSameDay(new Date(a.timestamp), day)
            );
            
            const present = new Set(dayAttendances.map(a => a.employer_registration_id)).size;
            const late = dayAttendances.filter(a => a.status === 'late').length;
            const absent = employees.length - present;
            
            return {
                name: format(day, 'EEE'),
                present: present || 0,
                late: late || 0,
                absent: Math.max(0, absent) || 0
            };
        });
    };

    const getAttendanceDistribution = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayAttendances = attendance.filter(a => 
            a.timestamp.startsWith(today)
        );
        
        const presentCount = todayAttendances.filter(a => a.status === 'present').length;
        const late = todayAttendances.filter(a => a.status === 'late').length;
        const total = todayAttendances.length || 1;
        
        return [
            { name: 'Present', value: Math.round((presentCount / total) * 100) || 0, color: '#10b981' },
            { name: 'Late', value: Math.round((late / total) * 100) || 0, color: '#f59e0b' },
            { name: 'Absent', value: Math.round(((employees.length - presentCount - late) / employees.length) * 100) || 0, color: '#ef4444' }
        ];
    };

    const totalEmployees = employees.length;
    const activeToday = new Set(attendance.filter(a => a.timestamp.startsWith(format(new Date(), 'yyyy-MM-dd'))).map(a => a.employer_registration_id)).size;
    const lateToday = attendance.filter(a => a.timestamp.startsWith(format(new Date(), 'yyyy-MM-dd')) && a.status === 'late').length;
    const absentToday = totalEmployees - activeToday;

    const stats = [
        { title: 'Total Personnel', value: totalEmployees.toString().padStart(2, '0'), growth: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Present Today', value: activeToday.toString().padStart(2, '0'), growth: '+5%', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Late Entries', value: lateToday.toString().padStart(2, '0'), growth: '-2%', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Unaccounted', value: absentToday.toString().padStart(2, '0'), growth: '+1%', icon: UserMinus, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const weeklyData = getDynamicWeeklyData();
    const attendanceDistribution = getAttendanceDistribution();
    const presentPercentage = attendanceDistribution[0]?.value || 0;

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-secondary" />
                        Real-time Performance Metrics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-semibold uppercase tracking-widest text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-secondary" />
                        <span>{format(new Date(), 'MMM dd')} - {format(subDays(new Date(), 7), 'MMM dd, yyyy')}</span>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95">
                        <Target className="w-3.5 h-3.5" />
                        <span>Report Details</span>
                    </button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <stat.icon className="w-16 h-16 text-foreground" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                                stat.growth.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {stat.growth}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-foreground tracking-tight tabular-nums mb-1">{stat.value}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</div>
                    </div>
                ))}
            </section>

            {/* Main Graph Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Primary Bar Chart */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Attendance Trends</h3>
                            <p className="text-[10px] font-semibold text-muted-foreground">Daily activity breakdown for the current week</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-semibold uppercase text-muted-foreground">Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[9px] font-semibold uppercase text-muted-foreground">Late</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                                    dy={10}
                                    className="text-muted-foreground"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                                    className="text-muted-foreground"
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                                    }}
                                />
                                <Bar dataKey="present" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Metrics / Pie Chart */}
                <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Status Distribution</h3>
                        <p className="text-[10px] font-semibold text-muted-foreground">Overall ratio of attendance categories</p>
                    </div>
                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceDistribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendanceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: 900
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-bold text-foreground">{presentPercentage}%</span>
                            <span className="text-[8px] font-semibold uppercase text-muted-foreground tracking-widest">Score</span>
                        </div>
                    </div>
                    <div className="mt-auto space-y-3">
                        {attendanceDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className={cn("text-[10px] font-bold text-foreground uppercase tracking-widest", item.name === 'On Time' && "text-emerald-500")}>{item.name === 'On Time' ? 'Present' : item.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground transition-colors group-hover:text-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Latest Departures</h3>
                        <button className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline">
                            View Logs <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {employees.slice(0, 4).map((emp, idx) => {
                            const empTimeOuts = attendance
                                .filter(a => a.employer_registration_id === emp.id && a.type === 'time_out')
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                            const latestTimeOut = empTimeOuts[0];
                            
                            return (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center font-bold text-secondary border border-secondary/20">
                                            {emp.employer_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-foreground group-hover:text-secondary transition-colors tabular-nums tracking-tight">{emp.employer_name}</div>
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider transition-opacity">{emp.employer_position || 'Staff'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-foreground tabular-nums tracking-tight">
                                            {latestTimeOut ? format(new Date(latestTimeOut.timestamp), 'hh:mm a') : '--:-- --'}
                                        </div>
                                        <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                                            {latestTimeOut ? 'Exited' : 'Not Exited'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Efficiency Index</h3>
                        <button className="px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-foreground transition-all">Monthly</button>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: 900
                                    }}
                                />
                                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                         <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest block">Average Score</span>
                            <span className="text-xl font-bold text-foreground tracking-tight">
                                {weeklyData.length > 0 
                                    ? Math.round(weeklyData.reduce((acc, d) => acc + (d.present / (d.present + d.late + d.absent || 1)) * 100, 0) / weeklyData.length)
                                    : 0}%
                            </span>
                         </div>
                         <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;