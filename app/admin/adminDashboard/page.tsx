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
    Target,
    RefreshCw
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
    Cell,
    Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';
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
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, attRes] = await Promise.all([
                fetch(`${ENV.API_URL}/registration`),
                fetch(`${ENV.API_URL}/attendance`)
            ]);
            
            if (empRes.ok) {
                const empData = await empRes.json();
                setEmployees(Array.isArray(empData) ? empData : (empData.data || []));
            }
            
            if (attRes.ok) {
                const attData = await attRes.json();
                setAttendance(Array.isArray(attData) ? attData : []);
            }
        } catch (e) {
            console.error('Failed to fetch dashboard data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getDynamicWeeklyData = () => {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: today });

        return weekDays.map(day => {
            const dayTimeIns = attendance.filter(a => 
                isSameDay(new Date(a.timestamp), day) && a.type === 'time_in'
            );
            
            const uniquePresent = new Set(dayTimeIns.map(a => a.employer_registration_id)).size;
            const actualLate = dayTimeIns.filter(a => a.status === 'late').length;
            
            return {
                name: format(day, 'EEE'),
                day: format(day, 'd'),
                present: uniquePresent,
                late: actualLate
            };
        });
    };

    const getAttendanceDistribution = () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayTimeIns = attendance.filter(a => 
            a.timestamp.startsWith(todayStr) && a.type === 'time_in'
        );
        
        const uniqueToday = new Set(todayTimeIns.map(a => a.employer_registration_id)).size;
        const lateToday = todayTimeIns.filter(a => a.status === 'late').length;
        const presentToday = uniqueToday - lateToday;
        
        return [
            { name: 'Present', value: presentToday, color: '#10b981', bg: 'bg-emerald-500' },
            { name: 'Late', value: lateToday, color: '#f59e0b', bg: 'bg-amber-500' }
        ];
    };

    const getMonthlyTrendData = () => {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: today });

        return daysInMonth.map(day => {
            const dayTimeIns = attendance.filter(a => 
                isSameDay(new Date(a.timestamp), day) && a.type === 'time_in'
            );
            const present = new Set(dayTimeIns.map(a => a.employer_registration_id)).size;
            
            return {
                name: format(day, 'd'),
                present: present
            };
        });
    };

    const totalEmployees = employees.length;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayTimeIns = attendance.filter(a => 
        a.timestamp.startsWith(todayStr) && a.type === 'time_in'
    );
    const activeToday = new Set(todayTimeIns.map(a => a.employer_registration_id)).size;
    const lateToday = todayTimeIns.filter(a => a.status === 'late').length;
    const absentToday = Math.max(0, totalEmployees - activeToday);

    const stats = [
        { title: 'Total Personnel', value: totalEmployees.toString().padStart(2, '0'), growth: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Present Today', value: activeToday.toString().padStart(2, '0'), growth: '+5%', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Late Entries', value: lateToday.toString().padStart(2, '0'), growth: '-2%', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Unaccounted', value: absentToday.toString().padStart(2, '0'), growth: '+1%', icon: UserMinus, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const weeklyData = getDynamicWeeklyData();
    const monthlyData = getMonthlyTrendData();
    const attendanceDistribution = getAttendanceDistribution();
    const presentPercentage = totalEmployees > 0 ? Math.round((activeToday / totalEmployees) * 100) : 0;
    const averageEfficiency = weeklyData.length > 0 
        ? Math.round(weeklyData.reduce((acc, d) => acc + (d.present > 0 ? 100 : 0), 0) / weeklyData.length)
        : 0;

    return (
        <div className="flex flex-col gap-4 sm:gap-5 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">

            {/* Page Title */}
            <header className="flex flex-wrap items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
                    </div>
                    <p className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] leading-none opacity-70 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-secondary" />
                        Real-time Performance Metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-secondary" />
                        <span>{format(new Date(), 'MMM dd')} - {format(subDays(new Date(), 7), 'MMM dd')}</span>
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group hover:scale-[1.01] transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <stat.icon className="w-16 h-16 text-foreground" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.title}</div>
                                <div className="text-[8px] font-bold text-emerald-500 flex items-center gap-1">
                                    <TrendingUp className="w-2 h-2" />
                                    {stat.growth}
                                </div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight flex items-center gap-1">
                            {stat.value}
                            <TrendingUp className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                    </div>
                ))}
            </section>

            {/* Main Graph Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Primary Bar Chart */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Weekly Attendance</h3>
                            <p className="text-[9px] font-bold text-muted-foreground">Daily activity breakdown</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">Late</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
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
                                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Metrics / Pie Chart */}
                <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Today&apos;s Status</h3>
                        <p className="text-[9px] font-bold text-muted-foreground">Attendance breakdown</p>
                    </div>
                    <div className="h-[160px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={3}
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
                            <span className="text-2xl font-bold text-foreground">{presentPercentage}%</span>
                            <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Rate</span>
                        </div>
                    </div>
                    <div className="mt-auto space-y-2">
                        {attendanceDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", item.bg)} />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{item.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity & Efficiency Index */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Latest Departures</h3>
                        <button className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline">
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {employees.slice(0, 5).map((emp, idx) => {
                            const empTimeOuts = attendance
                                .filter(a => a.employer_registration_id === emp.id && a.type === 'time_out')
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                            const latestTimeOut = empTimeOuts[0];
                            
                            return (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center font-bold text-secondary border border-secondary/20">
                                            {emp.employer_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-foreground group-hover:text-secondary transition-colors">{emp.employer_name}</div>
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{emp.employer_position || 'Staff'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-foreground">
                                            {latestTimeOut ? format(new Date(latestTimeOut.timestamp), 'hh:mm a') : '--:-- --'}
                                        </div>
                                        <div className={cn("text-[8px] font-bold uppercase tracking-widest",
                                            latestTimeOut ? 'text-emerald-500' : 'text-rose-500'
                                        )}>
                                            {latestTimeOut ? 'Exited' : 'Not Exited'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Monthly Trend</h3>
                            <p className="text-[9px] font-bold text-muted-foreground">Attendance performance</p>
                        </div>
                        <button className="px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-foreground transition-all">
                            This Month
                        </button>
                    </div>
                    <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0089C0" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0089C0" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: 900
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="present" 
                                    stroke="#0089C0" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorPresent)" 
                                    name="Present"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Weekly Avg</span>
                            <span className="text-lg font-bold text-foreground tracking-tight">{averageEfficiency}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;