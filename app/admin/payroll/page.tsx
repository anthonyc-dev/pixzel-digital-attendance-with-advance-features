'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Banknote,
    Search,
    Download,
    TrendingUp,
    Wallet,
    CreditCard,
    Plus,
    X,
    RefreshCw,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Pencil,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';

interface PayrollRecord {
    id: string;
    employer_registration_id: string;
    full_name: string;
    position: string;
    base_salary: number;
    gross_pay: number;
    net_pay: number;
    period: string;
    total_deduction: number;
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
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
    const [editSalaryAmount, setEditSalaryAmount] = useState('');
    const [editDeductions, setEditDeductions] = useState('');
    const [editStatus, setEditStatus] = useState<'pending' | 'processed' | 'paid'>('pending');
    const [isEditing, setIsEditing] = useState(false);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${month}-${day}-${year}`;
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
            }
        } catch (e) {
            console.error('Failed to fetch payroll data:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceData = useCallback(async () => {
        if (!selectedEmployer || !startDate || !endDate) return;

        const employee = employees.get(selectedEmployer);
        if (!employee) return;

        try {
            const res = await fetch(`${ENV.API_URL}/dtr?employer_id=${employee.employer_id}&start_date=${startDate}&end_date=${endDate}`);
            if (res.ok) {
                const data = await res.json();
                const records = Array.isArray(data) ? data : (data.data || []);

                let late = 0;
                let absent = 0;

                records.forEach((record: { date?: string; status?: string; is_late?: boolean }) => {
                    const status = record.status?.toLowerCase();
                    if (status === 'absent') {
                        absent++;
                    } else if (record.is_late === true) {
                        late++;
                    }
                });

                setLateCount(late);
                setAbsentCount(absent);
            }
        } catch (e) {
            console.error('Failed to fetch DTR:', e);
        }
    }, [selectedEmployer, startDate, endDate, employees]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && !target.closest('.action-menu-button') && !target.closest('.action-menu-dropdown')) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleAddSalary = async () => {
        if (!selectedEmployer || !salaryAmount || !startDate || !endDate) {
            alert('Please select an employee, enter a salary amount, and select date range');
            return;
        }

        const employee = employees.get(selectedEmployer);
        if (!employee) {
            alert('Employee not found. Please refresh and try again.');
            return;
        }

        setProcessing(true);
        try {
            const baseSalary = parseFloat(salaryAmount);
            const grossPay = baseSalary;

            const lateDeduction = lateCount * 50;
            const absentDeduction = absentCount * 100;
            const totalDeduction = lateDeduction + absentDeduction;

            const netPay = grossPay - totalDeduction;

            const period = `${formatDate(startDate)} - ${formatDate(endDate)}`;

            const res = await fetch(`${ENV.API_URL}/payroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employer_registration_id: selectedEmployer,
                    full_name: employee.employer_name,
                    position: employee.employer_position,
                    base_salary: baseSalary,
                    gross_pay: grossPay,
                    net_pay: netPay,
                    period,
                    total_deduction: totalDeduction,
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

    const handleDeletePayroll = async () => {
        if (!showDeleteConfirm) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${ENV.API_URL}/payroll/${showDeleteConfirm}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                setPayrollRecords(prev => prev.filter(p => p.id !== showDeleteConfirm));
            }
        } catch (e) {
            console.error('Failed to delete payroll:', e);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(null);
            setOpenActionMenu(null);
        }
    };

    const handleEditClick = (record: PayrollRecord) => {
        setEditingRecord(record);
        setEditSalaryAmount(record.base_salary.toString());
        setEditDeductions(record.total_deduction.toString());
        setEditStatus(record.status as 'pending' | 'processed' | 'paid');
        setShowEditModal(true);
        setOpenActionMenu(null);
    };

    const handleUpdatePayroll = async () => {
        if (!editingRecord || !editSalaryAmount) return;

        setIsEditing(true);
        try {
            const baseSalary = parseFloat(editSalaryAmount);
            const totalDeduction = parseFloat(editDeductions) || 0;
            const netPay = baseSalary - totalDeduction;

            const res = await fetch(`${ENV.API_URL}/payroll/${editingRecord.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingRecord,
                    base_salary: baseSalary,
                    total_deduction: totalDeduction,
                    net_pay: netPay,
                    status: editStatus
                })
            });

            if (res.ok) {
                setPayrollRecords(prev => prev.map(p =>
                    p.id === editingRecord.id
                        ? { ...p, base_salary: baseSalary, total_deduction: totalDeduction, net_pay: netPay, status: editStatus }
                        : p
                ));
                setShowEditModal(false);
                setEditingRecord(null);
            }
        } catch (e) {
            console.error('Failed to update payroll:', e);
        } finally {
            setIsEditing(false);
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
        sum + p.total_deduction, 0);
    const processedCount = payrollRecords.filter(p => p.status === 'processed' || p.status === 'paid').length;

    const stats = [
        { title: 'Total Payroll', value: `₱ ${totalPayroll.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'This Period', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Avg Net Pay', value: `₱ ${avgNetPay.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'Per Employee', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Deductions', value: `₱ ${totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'All Employees', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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
        <div className="flex flex-col gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

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
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer">
                        <Plus className="w-3.5 h-3.5 text-secondary" />
                        <span>Add Payroll</span>
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
                            className="flex items-center gap-1 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <option value="all" className="text-black">All Status</option>
                            <option value="pending" className="text-black">Pending</option>
                            <option value="processed" className="text-black">Processed</option>
                            <option value="paid" className="text-black">Paid</option>
                        </select>
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
                                    return (
                                        <tr key={record.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                            <td className="p-5 text-left">
                                                <div className="flex items-center gap-3">
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
                                                -₱ {record.total_deduction.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-bold text-sm text-foreground tracking-tight">
                                                        ₱ {record.net_pay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            </td>
                                            <td className="p-5 text-xs font-bold text-foreground/70">
                                                {(() => {
                                                    const parts = record.period.split(/ to | - /);
                                                    if (parts.length === 2) {
                                                        return `${formatDate(parts[0])} - ${formatDate(parts[1])}`;
                                                    }
                                                    return record.period;
                                                })()}
                                            </td>
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
                                                <div className="relative inline-block">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenActionMenu(openActionMenu === record.id ? null : record.id)}
                                                        className="action-menu-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                                                    </button>
                                                    {openActionMenu === record.id && (
                                                        <div className="action-menu-dropdown absolute right-[calc(100%+12px)] top-1/2 -translate-y-[68%] z-50 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[140px] animate-in fade-in slide-in-from-right-4 duration-200">
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdateStatus(record.id, 'processed');
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                disabled={record.status !== 'pending'}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Process
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdateStatus(record.id, 'paid');
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                disabled={record.status !== 'processed'}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Mark Paid
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditClick(record)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4 text-secondary" />
                                                                Edit Payroll
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowDeleteConfirm(record.id);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
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
                                <X className="w-5 h-5 text-foreground cursor-pointer" />
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
                                className="w-full py-3 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? 'Creating...' : 'Create Payroll'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-bold tracking-tight text-foreground">Confirm Deletion</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                    Are you sure you want to remove this payroll record? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeletePayroll}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Payroll Modal */}
            {showEditModal && editingRecord && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl p-5 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold tracking-tight text-foreground">Edit Payroll</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingRecord(null);
                                    }}
                                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-foreground cursor-pointer" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Employee</div>
                                    <div className="text-sm font-bold text-foreground">{editingRecord.full_name}</div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Base Salary (PHP)</label>
                                    <input
                                        type="number"
                                        value={editSalaryAmount}
                                        onChange={(e) => setEditSalaryAmount(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-muted border border-gray-200 dark:border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-sm"
                                        placeholder="Enter amount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Deductions (PHP)</label>
                                    <input
                                        type="number"
                                        value={editDeductions}
                                        onChange={(e) => setEditDeductions(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-muted border border-gray-200 dark:border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-sm"
                                        placeholder="Enter deductions"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Status</label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value as 'pending' | 'processed' | 'paid')}
                                        className="w-full px-3 py-2.5 bg-muted border border-gray-200 dark:border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-sm dark:[color-scheme:dark]"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processed">Processed</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>

                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">New Net Pay</div>
                                    <div className="text-base font-bold text-foreground">
                                        ₱ {((parseFloat(editSalaryAmount) || 0) - (parseFloat(editDeductions) || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingRecord(null);
                                    }}
                                    className="flex-1 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdatePayroll}
                                    disabled={!editSalaryAmount || isEditing}
                                    className="flex-1 py-2.5 rounded-lg bg-secondary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-secondary/20 hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isEditing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollPage;
