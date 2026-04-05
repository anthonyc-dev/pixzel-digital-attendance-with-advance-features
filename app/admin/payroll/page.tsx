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
    X,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';

interface PayrollRecord {
    id: string;
    employer_registration_id: string;
    full_name: string;
    position: string;
    base_salary: number;
    allowances: number;
    gross_pay: number;
    overtime_pay: number;
    sss: number;
    philhealth: number;
    pagibig: number;
    tax: number;
    late_deduction: number;
    absent_deduction: number;
    net_pay: number;
    payment_method: string;
    period: string;
    status: 'pending' | 'processed' | 'paid';
    created_at: string;
    processed_at: string | null;
}

interface Employee {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    status: string;
    image: string | null;
    created_at: string;
}

const PayrollPage = () => {
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedEmployer, setSelectedEmployer] = useState('');
    const [salaryAmount, setSalaryAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lateCount, setLateCount] = useState(0);
    const [absentCount, setAbsentCount] = useState(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedEmployer && startDate && endDate) {
            fetchAttendanceData();
        }
    }, [selectedEmployer, startDate, endDate]);

    const fetchAttendanceData = async () => {
        try {
            const res = await fetch(`${ENV.API_URL}/attendance?employer_id=${selectedEmployer}&start_date=${startDate}&end_date=${endDate}`);
            if (res.ok) {
                const data = await res.json();
                const records = Array.isArray(data) ? data : (data.data || []);

                // Identify dates that are holidays or events
                const holidayDates = new Set();
                records.forEach((record: any) => {
                    const status = record.status?.toLowerCase();
                    if (status === 'holiday' || status === 'event') {
                        const timestamp = record.timestamp || record.created_at;
                        if (!timestamp) return;
                        const dateObj = new Date(timestamp);
                        const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                        holidayDates.add(date);
                    }
                });

                let late = 0;
                let absent = 0;

                // Track dates to ensure we only count one late/absent per day
                const countedDates = new Set<string>();

                records.forEach((record: any) => {
                    const status = record.status?.toLowerCase();
                    const timestamp = record.timestamp || record.created_at;
                    if (!timestamp) return;

                    // Get local date string YYYY-MM-DD to avoid UTC shift
                    const dateObj = new Date(timestamp);
                    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                    // Skip if this date is a holiday/event
                    if (holidayDates.has(date)) return;

                    if (status === 'absent') {
                        if (!countedDates.has(date)) {
                            absent++;
                            countedDates.add(date);
                        }
                    } else if (status === 'late') {
                        if (!countedDates.has(date)) {
                            late++;
                            countedDates.add(date);
                        }
                    }
                });

                setLateCount(late);
                setAbsentCount(absent);
            }
        } catch (e) {
            console.error('Failed to fetch attendance:', e);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payrollRes, empRes] = await Promise.all([
                fetch(`${ENV.API_URL}/payroll`),
                fetch(`${ENV.API_URL}/registration`)
            ]);

            if (payrollRes.ok) {
                const payrollData = await payrollRes.json();
                setPayrollRecords(Array.isArray(payrollData) ? payrollData : (payrollData.data || []));
            }

            if (empRes.ok) {
                const empData = await empRes.json();
                const empMap = new Map<string, Employee>();
                const empList = Array.isArray(empData) ? empData : (empData.data || []);
                empList.forEach((emp: Employee) => {
                    empMap.set(String(emp.id), emp);
                });
                setEmployees(empMap);
                console.log('Employees loaded:', empList.length);
            }
        } catch (e) {
            console.error('Failed to fetch payroll data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSalary = async () => {
        console.log('handleAddSalary called', { selectedEmployer, salaryAmount, employeesSize: employees.size });

        if (!selectedEmployer || !salaryAmount || !startDate || !endDate) {
            alert('Please select an employee, enter a salary amount, and select date range');
            return;
        }

        const employee = employees.get(selectedEmployer);
        console.log('Looking for employee:', selectedEmployer, 'Found:', employee);

        if (!employee) {
            alert('Employee not found. Please refresh and try again.');
            return;
        }

        setProcessing(true);
        try {
            const baseSalary = parseFloat(salaryAmount);
            const allowances = 0;
            const grossPay = baseSalary + allowances;
            const sss = grossPay * 0;
            const philhealth = grossPay * 0;
            const pagibig = grossPay * 0;
            const tax = grossPay * 0;

            const lateDeduction = lateCount * 50;
            const absentDeduction = absentCount * 100;
            const attendanceDeductions = lateDeduction + absentDeduction;

            const netPay = grossPay - sss - philhealth - pagibig - tax - attendanceDeductions;

            const period = `${startDate} to ${endDate}`;

            const res = await fetch(`${ENV.API_URL}/payroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employer_registration_id: selectedEmployer,
                    full_name: employee.employer_name,
                    position: employee.employer_position,
                    base_salary: baseSalary,
                    allowances,
                    gross_pay: grossPay,
                    overtime_pay: 0,
                    sss,
                    philhealth,
                    pagibig,
                    tax,
                    late_deduction: lateDeduction,
                    absent_deduction: absentDeduction,
                    net_pay: netPay,
                    payment_method: 'bank_transfer',
                    period,
                    status: 'pending'
                })
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const error = JSON.parse(errorText);
                    alert(error.error || 'Failed to create payroll');
                } catch {
                    alert('Failed to create payroll');
                }
                return;
            }

            await fetchData();
            setShowSalaryModal(false);
            setSelectedEmployer('');
            setSalaryAmount('');
            setStartDate('');
            setEndDate('');
            setLateCount(0);
            setAbsentCount(0);
        } catch (e) {
            console.error('Failed to add salary:', e);
            alert('Failed to create payroll');
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'processed' | 'paid') => {
        const record = payrollRecords.find(p => p.id === id);
        if (!record) return;

        try {
            const res = await fetch(`${ENV.API_URL}/payroll/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...record,
                    status: newStatus
                })
            });

            if (res.ok) {
                setPayrollRecords(prev => prev.map(p =>
                    p.id === id ? { ...p, status: newStatus } : p
                ));
            }
        } catch (e) {
            console.error('Failed to update status:', e);
        }
    };

    const filteredRecords = payrollRecords.filter(record => {
        const employee = employees.get(record.employer_registration_id);
        const nameMatch = record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee?.employer_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const statusMatch = filterStatus === 'all' || record.status === filterStatus;
        return nameMatch && statusMatch;
    });

    const totalPayroll = payrollRecords.reduce((sum, p) => sum + p.net_pay, 0);
    const avgNetPay = payrollRecords.length > 0
        ? totalPayroll / payrollRecords.length
        : 0;
    const totalDeductions = payrollRecords.reduce((sum, p) =>
        sum + p.sss + p.philhealth + p.pagibig + p.tax, 0);
    const processedCount = payrollRecords.filter(p => p.status === 'processed' || p.status === 'paid').length;

    const stats = [
        { title: 'Total Payroll', value: `₱ ${totalPayroll.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'This Period', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Avg Net Pay', value: `₱ ${avgNetPay.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'Per Employee', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Deductions', value: `₱ ${totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'All Employees', icon: PieChart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: 'Processed', value: processedCount.toString().padStart(2, '0'), sub: 'Employees', icon: CreditCard, color: 'text-secondary', bg: 'bg-secondary/10' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'processed': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'paid': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'pending': return <Clock className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Employee Payroll</h1>
                        <button
                            onClick={fetchData}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSalaryModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                        <Plus className="w-3.5 h-3.5 text-secondary" />
                        <span>Add Payroll</span>
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

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group hover:scale-[1.01] transition-all relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.title}</div>
                                <div className="text-[8px] font-bold text-gray-400 flex items-center gap-1">
                                    {stat.sub}
                                </div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight flex items-center gap-1">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </section>

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
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processed">Processed</option>
                            <option value="paid">Paid</option>
                        </select>
                        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-md shadow-secondary/10">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Batch Process</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/10 border-b border-gray-100 dark:border-white/5 text-center">
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Employee</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Base Salary</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Deductions</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Net Pay</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Period</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Status</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-center">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="p-5"><div className="h-12 bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No Payroll Records Found</td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const employee = employees.get(record.employer_registration_id);
                                    const totalDeductions = record.sss + record.philhealth + record.pagibig + record.tax + (record.late_deduction || 0) + (record.absent_deduction || 0);
                                    return (
                                        <tr key={record.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                            <td className="p-5 text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {employee?.image ? (
                                                            <Image src={employee.image} alt={record.full_name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover border border-white dark:border-white/10 shadow-md transition-all" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-lg font-bold text-secondary">
                                                                {record.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight group-hover:text-secondary transition-colors">{record.full_name}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{record.position}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 font-bold text-foreground/80 tabular-nums text-xs">
                                                ₱ {record.base_salary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-5 text-rose-500 font-bold tabular-nums text-xs">
                                                -₱ {totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-bold text-sm text-foreground tracking-tight">
                                                        ₱ {record.net_pay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            </td>
                                            <td className="p-5 text-xs font-bold text-foreground/70">{record.period}</td>
                                            <td className="p-5">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className={cn(
                                                        "px-3 py-1 text-[8px] font-bold uppercase tracking-[0.1em] rounded-lg border flex items-center gap-1",
                                                        record.status === 'pending' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                                        record.status === 'processed' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                                        record.status === 'paid' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                                    )}>
                                                        {getStatusIcon(record.status)}
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-1">
                                                    {record.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(record.id, 'processed')}
                                                            className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 rounded hover:bg-emerald-500/20 transition-colors"
                                                        >
                                                            Process
                                                        </button>
                                                    )}
                                                    {record.status === 'processed' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(record.id, 'paid')}
                                                            className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-600 rounded hover:bg-blue-500/20 transition-colors"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
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
                            <h3 className="text-xl font-bold text-foreground">Add Payroll Record</h3>
                            <button
                                onClick={() => {
                                    setShowSalaryModal(false);
                                    setSelectedEmployer('');
                                    setSalaryAmount('');
                                    setStartDate('');
                                    setEndDate('');
                                    setLateCount(0);
                                    setAbsentCount(0);
                                }}
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
                                    {Array.from(employees.values()).map(emp => (
                                        <option key={emp.id} value={emp.id} className="text-foreground">{emp.employer_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
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
                            {(lateCount > 0 || absentCount > 0) && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground">Late Count:</span>
                                        <span className="font-bold text-rose-500">{lateCount} x ₱50 = ₱{lateCount * 50}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground">Absent Count:</span>
                                        <span className="font-bold text-rose-500">{absentCount} x ₱100 = ₱{absentCount * 100}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-rose-500/20">
                                        <span className="text-foreground font-bold">Total Deductions:</span>
                                        <span className="font-bold text-rose-500">₱{(lateCount * 50) + (absentCount * 100)}</span>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleAddSalary}
                                disabled={!selectedEmployer || !salaryAmount || !startDate || !endDate || processing}
                                className="w-full py-3 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Creating...' : 'Create Payroll'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollPage;