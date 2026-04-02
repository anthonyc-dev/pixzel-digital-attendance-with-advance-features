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
    AlertTriangle,
    UserCheck,
    UserMinus,
    MoreVertical,
    FileSpreadsheet,
    FileText,
    ArrowLeft,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    AlertCircle
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
    time_in?: string;
    time_out?: string;
    excuse?: string;
    created_at: string;
}

const DTRPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && !target.closest('.action-menu-button') && !target.closest('.action-menu-dropdown')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch employers
                const empRes = await fetch('/api/registration', { cache: 'no-store' });
                const empData = await empRes.json();
                setEmployees(empData.data || []);

                // Fetch attendance records
                const attRes = await fetch('/api/attendance', { cache: 'no-store' });
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

    const onTimeRate = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'active').length / attendance.length) * 100)
        : 100;

    const stats = [
        { title: 'Total Handled', value: employees.length.toString().padStart(2, '0'), icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'On Time Rate', value: `${onTimeRate}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
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

                {!selectedEmployee && (
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
                )}
            </header>

            {/* Stats Summary */}
            {!selectedEmployee && (
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
            )}

            {/* Main Content Area */}
            <div className="flex flex-col gap-6">
                {/* Navigation and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {selectedEmployee ? (
                        <button
                            onClick={() => {
                                setSelectedEmployee(null);
                                setSearchTerm('');
                            }}
                            className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-secondary cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <>
                            <div className="relative group w-full max-w-5xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by Employer Name or Position..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                                <Filter className="w-3.5 h-3.5 text-secondary" />
                                <span>All Departments</span>
                            </button>
                        </>
                    )}
                </div>

                {!selectedEmployee ? (
                    /* Employer Cards Grid - 4 per row */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse border border-gray-100 dark:border-white/5" />
                            ))
                        ) : filteredEmployees.length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-40">
                                <UserMinus className="w-16 h-16 mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs">No Employers Found</p>
                            </div>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="group relative flex flex-col items-center p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-secondary/10 text-center overflow-hidden cursor-pointer"
                                >
                                    {/* Watermark Logo */}
                                    {emp.image && (
                                        <div className="absolute inset-0 z-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                                            <Image
                                                src={emp.image}
                                                alt="watermark"
                                                fill
                                                className="object-cover scale-150 grayscale"
                                            />
                                        </div>
                                    )}

                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>

                                    <div className="relative mb-4 z-10">
                                        <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-700" />
                                        {emp.image ? (
                                            <Image
                                                src={emp.image}
                                                alt={emp.employer_name}
                                                width={80}
                                                height={80}
                                                className="relative w-20 h-20 rounded-lg object-cover border-2 border-white dark:border-white/10 shadow-xl transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="relative w-20 h-20 rounded-lg bg-secondary/10 flex items-center justify-center text-3xl font-black text-secondary border-2 border-white dark:border-white/10 shadow-xl transition-all">
                                                {emp.employer_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1 mb-4 z-10">
                                        <span className="text-[10px] font-black text-secondary tracking-[0.2em] uppercase">{emp.employer_id}</span>
                                        <h3 className="font-black text-sm text-foreground tracking-tight line-clamp-1">{emp.employer_name}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest line-clamp-1 mb-2">{emp.employer_position}</p>

                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current",
                                            emp.status === 'active' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                emp.status === 'late' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                    "bg-red-500/10 text-red-600 border-red-500/20"
                                        )}>
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            {emp.status}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 z-10">
                                        <span>Activity Log</span>
                                        <span className="text-foreground">{attendance.filter(a => a.employer_id === emp.employer_id).length} Logs</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    /* Specific Employee DTR Table */
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex items-center gap-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ClipboardCheck className="w-24 h-24 text-secondary rotate-12" />
                            </div>
                            <div className="relative">
                                {selectedEmployee.image ? (
                                    <Image src={selectedEmployee.image} alt={selectedEmployee.employer_name} width={64} height={64} className="w-16 h-16 rounded-lg object-cover border-2 border-white dark:border-white/10 shadow-lg" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl font-black text-secondary uppercase">
                                        {selectedEmployee.employer_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-black text-secondary tracking-widest uppercase">{selectedEmployee.employer_id}</span>
                                </div>
                                <h2 className="text-xl font-black text-foreground tracking-tight">{selectedEmployee.employer_name}</h2>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedEmployee.employer_position}</p>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-2">
                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Viewing Record</div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>{format(new Date(), 'MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-center">
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Date Log</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Time In</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Time Out</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status Type</th>
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Remarks</th> 
                                            <th className="p-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-center">
                                        {attendance.filter(a => a.employer_id === selectedEmployee.employer_id).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-10 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-40">
                                                        <UserMinus className="w-12 h-12" />
                                                        <p className="font-black uppercase tracking-widest text-[10px]">No Records Found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            attendance
                                                .filter(a => a.employer_id === selectedEmployee.employer_id)
                                                .map((log) => (
                                                    <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300">
                                                        <td className="p-3">
                                                            <div className="flex flex-col items-center">
                                                                <span className="font-black text-[11px] tracking-tight text-foreground/80">{format(new Date(log.created_at), 'MMM dd, yyyy')}</span>
                                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{format(new Date(log.created_at), 'EEEE')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="text-[10px] font-black text-green-500 tabular-nums bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/10">
                                                                {log.time_in || format(new Date(log.created_at), 'hh:mm aa')}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="text-[10px] font-black text-red-500 tabular-nums bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/10 opacity-80">
                                                                {log.time_out || '--:-- --'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ring-1 ring-inset",
                                                                (log.status === 'present' || log.status === 'active') ? "bg-green-500/10 text-green-600 ring-green-600/20 border-green-600/30" :
                                                                    log.status === 'late' ? "bg-yellow-500/10 text-yellow-600 ring-yellow-600/20 border-yellow-600/30" :
                                                                        log.status === 'excuse' ? "bg-blue-500/10 text-blue-600 ring-blue-600/20 border-blue-600/30" :
                                                                            "bg-red-500/10 text-red-600 ring-red-600/20 border-red-600/30"
                                                            )}>
                                                                <div className={cn("w-1 h-1 rounded-full",
                                                                    (log.status === 'present' || log.status === 'active') ? "bg-green-600" :
                                                                        log.status === 'late' ? "bg-yellow-600" :
                                                                            log.status === 'excuse' ? "bg-blue-600" : "bg-red-600"
                                                                )} />
                                                                <span>{log.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex flex-col items-center gap-1">
                                                                {log.excuse ? (
                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit">
                                                                        <AlertCircle className="w-2.5 h-2.5" />
                                                                        <span>{log.excuse}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[8px] font-bold text-gray-400 uppercase opacity-40 italic">No Remarks</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center relative">
                                                            <div className="relative inline-block">
                                                                <button
                                                                    onClick={() => setOpenMenuId(openMenuId === log.id ? null : log.id)}
                                                                    className="action-menu-button p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400 cursor-pointer"
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4 pointer-events-none" />
                                                                </button>

                                                                {openMenuId === log.id && (
                                                                    <div className="action-menu-dropdown absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[120px] animate-in fade-in slide-in-from-right-2 duration-200">
                                                                        <button
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                                        >
                                                                            <Pencil className="w-3 h-3 text-secondary" />
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                                )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DTRPage;
