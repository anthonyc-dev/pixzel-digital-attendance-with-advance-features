'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Banknote,
    Search,
    Download,
    Wallet,
    CreditCard,
    RefreshCw,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Pencil,
    Trash2,
    Calendar,
    AlertCircle,
    Loader2
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
    late_count: number;
    absent_count: number;
    status: 'pending' | 'processed' | 'paid';
    created_at: string;
    processed_at: string | null;
}

interface Employer {
    id: string | number;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    base_salary: number;
    status: string;
    image: string | null;
    created_at: string;
}

interface DTRRecord {
    id: string;
    date: string;
    status: string;
    is_late: boolean;
}

const PayrollPage = () => {
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
    const [editDeductions, setEditDeductions] = useState('');
    const [editStatus, setEditStatus] = useState<'pending' | 'processed' | 'paid'>('pending');
    const [isEditing, setIsEditing] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${month}-${day}-${year}`;
    };

    const formatPeriod = (period: string) => {
        const oldFormatMatch = period.match(/(\d{2})-(\d{2})-(\d{4}) to (\d{2})-(\d{2})-(\d{4})/);
        if (oldFormatMatch) {
            return `${oldFormatMatch[1]}/${oldFormatMatch[2]}/${String(oldFormatMatch[3]).slice(-2)} to ${oldFormatMatch[4]}/${oldFormatMatch[5]}/${String(oldFormatMatch[6]).slice(-2)}`;
        }
        const newFormatMatch = period.match(/(\d{2})\/(\d{2})\/(\d{2}) to (\d{2})\/(\d{2})\/(\d{2})/);
        if (newFormatMatch) {
            return `${newFormatMatch[1]}/${newFormatMatch[2]}/${newFormatMatch[3]} to ${newFormatMatch[4]}/${newFormatMatch[5]}/${newFormatMatch[6]}`;
        }
        return period;
    };

    const getPayrollPeriod = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const shortYear = String(year).slice(-2);
        
        if (day <= 15) {
            return {
                startDate: `${year}-${String(month).padStart(2, '0')}-01`,
                endDate: `${year}-${String(month).padStart(2, '0')}-15`,
                periodStr: `${String(month).padStart(2, '0')}/01/${shortYear} to ${String(month).padStart(2, '0')}/15/${shortYear}`
            };
        } else {
            const lastDay = new Date(year, month, 0).getDate();
            return {
                startDate: `${year}-${String(month).padStart(2, '0')}-16`,
                endDate: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
                periodStr: `${String(month).padStart(2, '0')}/16/${shortYear} to ${String(month).padStart(2, '0')}/${lastDay}/${shortYear}`
            };
        }
    };

    const getCurrentPayrollPeriod = () => {
        const today = new Date();
        return getPayrollPeriod(today);
    };

    const getPastPayrollPeriods = (count: number = 3) => {
        const periods = [];
        const today = new Date();

        for (let i = 0; i < count; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 15);
            periods.push(getPayrollPeriod(date));

            if (date.getDate() > 15) {
                const firstPeriod = getPayrollPeriod(new Date(date.getFullYear(), date.getMonth(), 1));
                periods.push(firstPeriod);
            }
        }

        return periods;
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
                console.log('Employer API response:', empData);
                const empList = Array.isArray(empData) ? empData : (empData.data || []);
                console.log('Employers loaded:', empList.length, empList);
                setEmployers(empList);
            }
        } catch (e) {
            console.error('Failed to fetch data:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDTRData = async (employerId: string, startDate: string, endDate: string) => {
        try {
            const res = await fetch(`${ENV.API_URL}/dtr?employer_id=${employerId}&start_date=${startDate}&end_date=${endDate}`);
            if (res.ok) {
                const data = await res.json();
                return Array.isArray(data) ? data : (data.data || []);
            }
        } catch (e) {
            console.error('Failed to fetch DTR:', e);
        }
        return [];
    };

    const computePayroll = useCallback(async (employer: Employer, startDate: string, endDate: string, periodStr: string) => {
        console.log('Computing payroll for:', employer.employer_name, 'employer_id:', employer.employer_id, 'base_salary:', employer.base_salary);
        
        const dtrRecords: DTRRecord[] = await fetchDTRData(employer.employer_id, startDate, endDate);
        console.log('DTR Records found:', dtrRecords.length, dtrRecords);

        let lateCount = 0;
        let absentCount = 0;

        dtrRecords.forEach((record: DTRRecord) => {
            const status = record.status?.toLowerCase();
            console.log('DTR record:', record.date, 'status:', status, 'is_late:', record.is_late);
            if (status === 'absent') {
                absentCount++;
            } else if (record.is_late === true) {
                lateCount++;
            }
        });

        console.log('Late count:', lateCount, 'Absent count:', absentCount);

        const monthlySalary = parseFloat(String(employer.base_salary)) || 0;
        console.log('Monthly salary:', monthlySalary);
        
        const halfMonthSalary = monthlySalary / 2;
        const lateDeduction = lateCount * 50;
        const absentDeduction = absentCount * 100;
        const totalDeduction = lateDeduction + absentDeduction;
        const netPay = halfMonthSalary - totalDeduction;
        
        console.log('Half month salary:', halfMonthSalary, 'Deductions:', totalDeduction, 'Net pay:', netPay);

        return {
            employer_registration_id: employer.id,
            full_name: employer.employer_name,
            position: employer.employer_position,
            base_salary: halfMonthSalary,
            gross_pay: halfMonthSalary,
            net_pay: netPay > 0 ? netPay : 0,
            period: periodStr,
            total_deduction: totalDeduction,
            late_count: lateCount,
            absent_count: absentCount,
            status: 'pending' as const,
            processed_at: null
        };
    }, []);

    const handleGeneratePayroll = async () => {
        const period = getCurrentPayrollPeriod();
        setRegeneratingId('all');

        const newRecords: PayrollRecord[] = [];
        const updatedRecords: PayrollRecord[] = [];
        let skippedCount = 0;

        try {
            console.log('Generating payroll for period:', period.periodStr);
            console.log('Total employers:', employers.length);

            for (const employer of employers) {
                console.log('Processing employer:', employer.employer_name, 'base_salary:', employer.base_salary);

                const existingRecord = payrollRecords.find(
                    p => p.employer_registration_id === employer.id &&
                        p.period === period.periodStr
                );

                const baseSalary = parseFloat(String(employer.base_salary)) || 0;
                
                if (baseSalary <= 0) {
                    skippedCount++;
                    console.log('Skipping - no base salary:', employer.employer_name);
                    continue;
                }

                const computed = await computePayroll(employer, period.startDate, period.endDate, period.periodStr);

                if (existingRecord) {
                    console.log('Updating existing record for:', employer.employer_name);
                    const res = await fetch(`${ENV.API_URL}/payroll/${existingRecord.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...existingRecord,
                            base_salary: computed.base_salary,
                            gross_pay: computed.gross_pay,
                            net_pay: computed.net_pay,
                            total_deduction: computed.total_deduction,
                            late_count: computed.late_count,
                            absent_count: computed.absent_count
                        })
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        updatedRecords.push(updated);
                    }
                } else {
                    console.log('Creating new record for:', employer.employer_name, 'ID:', employer.id);
                    const res = await fetch(`${ENV.API_URL}/payroll`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            employer_registration_id: Number(employer.id),
                            full_name: employer.employer_name,
                            position: employer.employer_position,
                            base_salary: computed.base_salary,
                            gross_pay: computed.gross_pay,
                            net_pay: computed.net_pay,
                            period: computed.period,
                            total_deduction: computed.total_deduction,
                            late_count: computed.late_count,
                            absent_count: computed.absent_count,
                            status: 'pending'
                        })
                    });
                    
                    if (!res.ok) {
                        const error = await res.text();
                        console.error('Failed to create payroll:', error);
                    } else {
                        const created = await res.json();
                        console.log('Created payroll record:', created);
                        newRecords.push(created);
                    }
                }
            }

            console.log('New records created:', newRecords.length);
            console.log('Records updated:', updatedRecords.length);
            console.log('Skipped (no salary):', skippedCount);

            setPayrollRecords(prev => {
                let updated = [...prev];
                updatedRecords.forEach(upd => {
                    updated = updated.map(p => p.id === upd.id ? upd : p);
                });
                newRecords.forEach(newRecord => {
                    if (newRecord.id && !updated.some(p => p.id === newRecord.id)) {
                        updated.push(newRecord);
                    }
                });
                return updated;
            });

            if (newRecords.length === 0 && skippedCount > 0) {
                alert(`No payroll generated. ${skippedCount} employer(s) have no base salary set. Please set base salary in employer registration.`);
            }
        } catch (e) {
            console.error('Failed to generate payroll:', e);
            alert('Failed to generate payroll. Check console for details.');
        } finally {
            setRegeneratingId(null);
        }
    };

    const handleRegenerateSingle = async (record: PayrollRecord) => {
        const employer = employers.find(e => e.id === record.employer_registration_id);
        if (!employer || !employer.base_salary) return;

        setRegeneratingId(record.id);

        try {
            const parts = record.period.match(/(\d{2})\/(\d{2})\/(\d{2})/g);
            if (parts && parts.length === 2) {
                const startParts = parts[0].split('/');
                const endParts = parts[1].split('/');

                const startYear = '20' + startParts[2];
                const endYear = '20' + endParts[2];
                
                const startDate = `${startYear}-${startParts[0]}-${startParts[1]}`;
                const endDate = `${endYear}-${endParts[0]}-${endParts[1]}`;

                const computed = await computePayroll(employer, startDate, endDate, record.period);

                await fetch(`${ENV.API_URL}/payroll/${record.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...record,
                        base_salary: computed.base_salary,
                        gross_pay: computed.gross_pay,
                        net_pay: computed.net_pay,
                        total_deduction: computed.total_deduction,
                        late_count: computed.late_count,
                        absent_count: computed.absent_count
                    })
                });

                await fetchData();
            }
        } catch (e) {
            console.error('Failed to regenerate payroll:', e);
        } finally {
            setRegeneratingId(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        setEditDeductions(record.total_deduction.toString());
        setEditStatus(record.status as 'pending' | 'processed' | 'paid');
        setShowEditModal(true);
        setOpenActionMenu(null);
    };

    const handleUpdatePayroll = async () => {
        if (!editingRecord || !editDeductions) return;

        setIsEditing(true);
        try {
            const baseSalary = parseFloat(String(editingRecord.base_salary));
            const totalDeduction = parseFloat(editDeductions) || 0;
            const netPay = baseSalary - totalDeduction;

            const res = await fetch(`${ENV.API_URL}/payroll/${editingRecord.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingRecord,
                    total_deduction: totalDeduction,
                    net_pay: netPay,
                    status: editStatus
                })
            });

            if (res.ok) {
                setPayrollRecords(prev => prev.map(p =>
                    p.id === editingRecord.id
                        ? { ...p, total_deduction: totalDeduction, net_pay: netPay, status: editStatus }
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
        const employer = employers.find(e => e.id === record.employer_registration_id);
        const nameMatch = record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employer?.employer_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const statusMatch = filterStatus === 'all' || record.status === filterStatus;
        return nameMatch && statusMatch;
    });

    const totalPayroll = payrollRecords.reduce((sum, p) => sum + (p.net_pay || 0), 0);
    const avgNetPay = payrollRecords.length > 0
        ? totalPayroll / payrollRecords.length
        : 0;
    const totalDeductions = payrollRecords.reduce((sum, p) =>
        sum + (p.total_deduction || 0), 0);
    const processedCount = payrollRecords.filter(p => p.status === 'processed' || p.status === 'paid').length;

    const stats = [
        { title: 'Total Payroll', value: `₱ ${totalPayroll.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'This Period', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Avg Net Pay', value: `₱ ${avgNetPay.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'Per Employee', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Deductions', value: `₱ ${totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'All Employees', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: 'Processed', value: processedCount.toString().padStart(2, '0'), sub: 'Employees', icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'processed': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'paid': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'pending': return <Clock className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    const currentPeriod = getCurrentPayrollPeriod();
    const currentPeriodRecords = payrollRecords.filter(p => p.period === currentPeriod.periodStr);

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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-bold uppercase tracking-widest">Current Period:</span>
                        <span className="font-bold">{currentPeriod.periodStr}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleGeneratePayroll}
                        disabled={regeneratingId !== null}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer">
                        {regeneratingId === 'all' ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Computing...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Generate Payroll</span>
                            </>
                        )}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                        <Download className="w-3.5 h-3.5 text-secondary" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </header>

            {/* <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <div className="text-xs">
                        <p className="font-bold text-secondary uppercase tracking-widest mb-1">Auto-Computed Payroll</p>
                        <p className="text-muted-foreground">
                            Payroll is automatically calculated based on the employer&apos;s base salary (monthly / 2 = 15-day salary). 
                            Deductions are applied for late arrivals (₱50 each) and absences (₱100 each).
                        </p>
                    </div>
                </div>
            </div> */}

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
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <option value="all" className="text-black">All Status</option>
                            <option value="pending" className="text-black">Pending</option>
                            <option value="processed" className="text-black">Processed</option>
                            <option value="paid" className="text-black">Paid</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/10 border-b border-gray-100 dark:border-white/5 text-center">
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Employee</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">15-Day Salary</th>
                                <th className="p-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Late/Absent</th>
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
                                        <td colSpan={8} className="p-5"><div className="h-12 bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No Payroll Records Found</td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const employer = employers.find(e => e.id === record.employer_registration_id);
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
                                            <td className="p-5 text-xs">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={cn("font-bold", (record.late_count || 0) > 0 ? "text-amber-500" : "text-gray-400")}>
                                                        Late: {record.late_count || 0}
                                                    </span>
                                                    <span className={cn("font-bold", (record.absent_count || 0) > 0 ? "text-rose-500" : "text-gray-400")}>
                                                        Absent: {record.absent_count || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-rose-500 font-bold tabular-nums text-xs">
                                                -₱ {(record.total_deduction || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-5">
                                                <span className="font-bold text-sm text-foreground tracking-tight">
                                                    ₱ {(record.net_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="p-5 text-xs font-bold text-foreground/70">
                                                {formatPeriod(record.period)}
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
                                                                onClick={() => handleRegenerateSingle(record)}
                                                                disabled={regeneratingId === record.id}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-secondary hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <RefreshCw className={cn("w-4 h-4", regeneratingId === record.id && "animate-spin")} />
                                                                Recalculate
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditClick(record)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4 text-secondary" />
                                                                Edit Deductions
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
                                <h3 className="text-base font-bold tracking-tight text-foreground">Edit Payroll Deductions</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingRecord(null);
                                    }}
                                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-foreground cursor-pointer" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Employee</div>
                                    <div className="text-sm font-bold text-foreground">{editingRecord.full_name}</div>
                                </div>

                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Period</div>
                                    <div className="text-sm font-bold text-foreground">{editingRecord.period}</div>
                                </div>

                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">15-Day Salary</div>
                                    <div className="text-sm font-bold text-foreground">
                                        ₱ {editingRecord.base_salary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </div>
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
                                        ₱ {(editingRecord.base_salary - (parseFloat(editDeductions) || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
                                    disabled={!editDeductions || isEditing}
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
