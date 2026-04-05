'use client';

import React, { useEffect, useState } from 'react';
import {
    Banknote,
    Search,
    Download,
    TrendingUp,
    Wallet,
    CreditCard,
    DollarSign,
    PieChart,
    ArrowUpRight,
    Printer,
    ChevronDown,
    Plus,
    X
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SalaryRecord {
    id?: string;
    employer_id: string;
    base_salary: number;
    status: string;
    total_deductions?: number;
    late_count?: number;
    absent_count?: number;
}

interface Employee {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    status: string;
    image: string | null;
    created_at: string;
    base_salary?: number;
}

interface AttendanceRecord {
    id: string;
    employer_registration_id: string;
    type: 'time_in' | 'time_out';
    status: string;
    timestamp: string;
}

const PayrollPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedEmployer, setSelectedEmployer] = useState('');
    const [salaryAmount, setSalaryAmount] = useState('');

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
                console.error('Failed to fetch payroll data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddSalary = () => {
        if (!selectedEmployer || !salaryAmount) return;
        
        const newSalary: SalaryRecord = {
            employer_id: selectedEmployer,
            base_salary: parseFloat(salaryAmount),
            status: 'pending'
        };
        
        console.log('Adding salary:', newSalary);
        
        setSalaries(prev => {
            const existing = prev.find(s => s.employer_id === selectedEmployer);
            if (existing) {
                return prev.map(s => s.employer_id === selectedEmployer ? newSalary : s);
            }
            return [...prev, newSalary];
        });
        
        setShowSalaryModal(false);
        setSelectedEmployer('');
        setSalaryAmount('');
    };

    const getSalary = (empId: string): number => {
        const salary = salaries.find(s => s.employer_id === empId);
        return salary ? salary.base_salary : 0;
    };

    const getSalaryStatus = (empId: string): string => {
        const salary = salaries.find(s => s.employer_id === empId);
        return salary ? salary.status : 'not_set';
    };

    const calculateLateAndAbsent = (empId: string) => {
        const empLogs = attendance.filter(a => a.employer_registration_id === empId);
        const logsByDate: Record<string, { status: string }> = {};
        
        empLogs.forEach(log => {
            const date = log.timestamp.split('T')[0];
            if (!logsByDate[date]) {
                logsByDate[date] = { status: log.status };
            }
        });
        
        let lateCount = 0;
        let absentCount = 0;
        
        Object.values(logsByDate).forEach(day => {
            if (day.status === 'late') lateCount++;
            if (day.status === 'absent') absentCount++;
        });
        
        return { lateCount, absentCount };
    };

    const calculateDeductions = (empId: string) => {
        const { lateCount, absentCount } = calculateLateAndAbsent(empId);
        const baseSalary = getSalary(empId);
        
        const lateAmount = lateCount * 100;
        const absentAmount = absentCount * (baseSalary / 22);
        
        return {
            totalDeductions: lateAmount + absentAmount,
            lateCount,
            absentCount
        };
    };

    const calculateNetPay = (empId: string) => {
        const baseSalary = getSalary(empId);
        const { totalDeductions } = calculateDeductions(empId);
        return baseSalary - totalDeductions;
    };

    const calculateHours = (empId: string) => {
        const empLogs = attendance.filter(a => a.employer_registration_id === empId);
        const logsByDate: Record<string, { in?: Date, out?: Date }> = {};

        empLogs.forEach(log => {
            const date = log.timestamp.split('T')[0];
            if (!logsByDate[date]) logsByDate[date] = {};
            if (log.type === 'time_in') logsByDate[date].in = new Date(log.timestamp);
            else if (log.type === 'time_out') logsByDate[date].out = new Date(log.timestamp);
        });

        let totalMs = 0;
        let daysWorked = 0;
        Object.values(logsByDate).forEach(day => {
            if (day.in && day.out) {
                totalMs += day.out.getTime() - day.in.getTime();
                daysWorked++;
            }
        });

        return {
            hours: (totalMs / (1000 * 60 * 60)).toFixed(1),
            days: daysWorked
        };
    };

    const stats = [
        { title: 'Est. Total Payroll', value: `₱ ${(employees.length * 28500 / 1000).toFixed(0)}K`, sub: '+3.2%', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Avg Net Pay', value: '₱ 26.5K', sub: 'Per Month', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'System Deductions', value: '₱ 14.2K', sub: 'Total Box', icon: PieChart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: 'Processed', value: employees.length.toString().padStart(2, '0'), sub: 'Employees', icon: CreditCard, color: 'text-secondary', bg: 'bg-secondary/10' },
    ];

    const filteredEmployees = employees.filter(emp =>
        emp.employer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employer_position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

                {/* Page Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Employee Payroll</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSalaryModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                            <Plus className="w-3.5 h-3.5 text-secondary" />
                            <span>Add Salary</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                            <Printer className="w-3.5 h-3.5 text-secondary" />
                            <span>Print Slips</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all">
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </header>

                {/* Stats Section */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group hover:scale-[1.01] transition-all relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.title}</div>
                                    <div className="text-[8px] font-bold text-emerald-500 flex items-center gap-1">
                                        <TrendingUp className="w-2 h-2" />
                                        {stat.sub}
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight flex items-center gap-1">
                                {stat.value}
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Filters and List */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Employee for Payroll..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-gray-50 transition-all shadow-sm text-center">
                                <span>Filter by Status</span>
                                <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                            </button>
                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-md shadow-secondary/10">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Batch Process</span>
                            </button>
                        </div>
                    </div>

                    {/* List Wrapper */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/10 border-b border-gray-100 dark:border-white/5 text-center">
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Employee</th>
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Base Salary</th>
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Logged Hours</th>
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Total Deductions</th>
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Estimated Net</th>
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Payment Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-center">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={6} className="p-5"><div className="h-12 bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No Employers Found</td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => {
                                        const { hours, days } = calculateHours(emp.id);
                                        const baseSalary = getSalary(emp.id);
                                        const salaryStatus = getSalaryStatus(emp.id);
                                        const { totalDeductions } = calculateDeductions(emp.id);
                                        const netPay = calculateNetPay(emp.id);
                                        const salaryDisplay = baseSalary > 0 ? `₱ ${baseSalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'Not Set';
                                        const deductionsDisplay = totalDeductions > 0 ? `-₱ ${totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '₱ 0.00';
                                        const netPayDisplay = netPay > 0 ? `₱ ${netPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '₱ 0.00';
                                        return (
                                            <tr key={emp.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                                <td className="p-5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {emp.image ? (
                                                                <Image src={emp.image} alt={emp.employer_name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover border border-white dark:border-white/10 shadow-md transition-all" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-lg font-bold text-secondary">
                                                                    {emp.employer_name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm tracking-tight group-hover:text-secondary transition-colors">{emp.employer_name}</span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{emp.employer_position}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 font-bold text-foreground/80 tabular-nums text-xs">{salaryDisplay}</td>
                                                <td className="p-5">
                                                    <div className="flex flex-col leading-tight items-center">
                                                        <span className="font-bold text-foreground text-xs">{hours}h</span>
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{days} Days Solid</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-rose-500 font-bold tabular-nums text-xs">{deductionsDisplay}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-bold text-sm text-foreground tracking-tight">{netPayDisplay}</span>
                                                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className={cn(
                                                            "px-3 py-1 text-[8px] font-bold uppercase tracking-[0.1em] rounded-lg border",
                                                            salaryStatus === 'pending' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                                            salaryStatus === 'processed' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                                            salaryStatus === 'paid' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                                                            salaryStatus === 'not_set' && "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10"
                                                        )}>
                                                            {salaryStatus === 'not_set' ? 'Not Set' : salaryStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showSalaryModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-foreground">Set Base Salary</h3>
                                <button 
                                    onClick={() => setShowSalaryModal(false)}
                                    className="p-1 hover:bg-muted rounded-lg"
                                >
                                    <X className="w-5 h-5 text-foreground" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Select Employee</label>
                                    <select
                                        value={selectedEmployer}
                                        onChange={(e) => setSelectedEmployer(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    >
                                        <option value="" className="text-foreground">Choose an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id} className="text-foreground">{emp.employer_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Base Salary (PHP)</label>
                                    <input
                                        type="number"
                                        value={salaryAmount}
                                        onChange={(e) => setSalaryAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <button
                                    onClick={handleAddSalary}
                                    disabled={!selectedEmployer || !salaryAmount}
                                    className="w-full py-3 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Salary
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default PayrollPage;