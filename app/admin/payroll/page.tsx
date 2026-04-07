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
    Loader2,
    FileText,
    Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';

interface CalendarEvent {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    type: 'holiday' | 'event' | 'meeting' | 'other';
    description?: string;
}

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
    status: 'pending' | 'paid';
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
    time_in?: string | null;
    time_out?: string | null;
    excuse?: string | null;
}

interface DeductionSetting {
    id: number;
    late_deduction: number;
    absent_deduction: number;
    label: string;
}

const PayrollPage = () => {
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [deductionSettings, setDeductionSettings] = useState<DeductionSetting | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
    const [editDeductions, setEditDeductions] = useState('');
    const [editStatus, setEditStatus] = useState<'pending' | 'paid'>('pending');
    const [isEditing, setIsEditing] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [showPayslip, setShowPayslip] = useState(false);
    const [payslipRecord, setPayslipRecord] = useState<PayrollRecord | null>(null);

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

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payrollRes, empRes, deductionRes, eventsRes] = await Promise.all([
                fetch(`${ENV.API_URL}/payroll`, { cache: 'no-store' }),
                fetch(`${ENV.API_URL}/registration`, { cache: 'no-store' }),
                fetch(`${ENV.API_URL}/deduction-settings`, { cache: 'no-store' }),
                fetch(`${ENV.API_URL}/events`, { cache: 'no-store' })
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

            if (deductionRes.ok) {
                const deductionData = await deductionRes.json();
                setDeductionSettings(deductionData);
                console.log('Deduction settings loaded:', deductionData);
            }

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData || []);
                console.log('Events loaded for holiday checks', eventsData?.length);
            }
        } catch (e) {
            console.error('Failed to fetch data:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDTRData = async (employerId: string, startDate: string, endDate: string) => {
        try {
            // Fetch live raw attendance logs instead of rigid dtr_records to perfectly match DTR page
            const res = await fetch(`${ENV.API_URL}/attendance?employer_id=${employerId}&start_date=${startDate}&end_date=${endDate}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const logs = Array.isArray(data) ? data : (data.data || []);

                const grouped: Record<string, DTRRecord> = {};


                logs.forEach((log: unknown) => {
                    const logData = log as { id: string; timestamp: string; type: string; status: string; time_in?: string; time_out?: string };
                    // Extract PHT local date string (YYYY-MM-DD)
                    const dateObj = new Date(logData.timestamp);
                    const formatter = new Intl.DateTimeFormat('en-US', {
                        timeZone: 'Asia/Manila',
                        year: 'numeric', month: '2-digit', day: '2-digit'
                    });
                    const parts = formatter.formatToParts(dateObj);
                    const y = parts.find(p => p.type === 'year')?.value;
                    const m = parts.find(p => p.type === 'month')?.value;
                    const d = parts.find(p => p.type === 'day')?.value;
                    const dateKey = `${y}-${m}-${d}`;

                    if (!grouped[dateKey]) {
                        grouped[dateKey] = {
                            id: logData.id,
                            date: dateKey,
                            status: 'present',
                            is_late: false,
                        };
                    }

                    if (logData.type === 'time_in') {
                        if (logData.status === 'late') {
                            grouped[dateKey].is_late = true;
                            grouped[dateKey].status = 'late';
                        }
                    }
                });

                return Object.values(grouped);
            }
        } catch (e) {
            console.error('Failed to fetch DTR:', e);
        }
        return [];
    };

    const computePayroll = useCallback(async (
        employer: Employer,
        startDate: string,
        endDate: string,
        periodStr: string
    ) => {
        console.log('Computing payroll for:', employer.employer_name, 'employer_id:', employer.employer_id, 'base_salary:', employer.base_salary);

        const dtrRecords: DTRRecord[] = await fetchDTRData(employer.employer_id, startDate, endDate);
        console.log('DTR Records found:', dtrRecords.length, dtrRecords);

        let lateCount = 0;
        let absentCount = 0;

        // Ensure we properly parse the Date objects within the precise scope of the payroll period
        const currentDate = new Date(startDate);
        // Set time to safely avoid timezone offset stripping
        currentDate.setHours(12, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(12, 0, 0, 0);

        // We shouldn't punish absences for days that haven't occurred yet
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        while (currentDate <= end) {
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const d = String(currentDate.getDate()).padStart(2, '0');
            const loopDateStr = `${y}-${m}-${d}`;

            // Skip days in the future
            if (loopDateStr > todayStr) {
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }

            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

            const isHoliday = events.some(event => {
                if (event.type !== 'holiday') return false;
                if (!event.start_date || !event.end_date) return false;
                const sDateStr = event.start_date.split('T')[0];
                const eDateStr = event.end_date.split('T')[0];
                return loopDateStr >= sDateStr && loopDateStr <= eDateStr;
            });

            // Find matching DTR log from the real-time attendance logs
            const dayRecord = dtrRecords.find(r => r.date === loopDateStr);

            if (dayRecord) {
                // Log exists -> checking if they correctly received 'late'
                if (dayRecord.is_late) {
                    lateCount++;
                }
            } else {
                // Missing log -> if working day & not holiday, absent
                if (!isWeekend && !isHoliday) {
                    // Temporarily acting as absent; leaves support would be added here
                    absentCount++;
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('Late count:', lateCount, 'Absent count:', absentCount);

        const monthlySalary = parseFloat(String(employer.base_salary)) || 0;
        console.log('Monthly salary:', monthlySalary);

        // Use configurable rates; fall back to defaults if not loaded yet
        const lateRate = deductionSettings?.late_deduction ?? 50;
        const absentRate = deductionSettings?.absent_deduction ?? 100;

        const halfMonthSalary = monthlySalary / 2;
        const lateDeduction = lateCount * lateRate;
        const absentDeduction = absentCount * absentRate;
        const totalDeduction = lateDeduction + absentDeduction;
        const netPay = halfMonthSalary - totalDeduction;

        console.log('Half month salary:', halfMonthSalary, 'Rates: late=', lateRate, 'absent=', absentRate, 'Deductions:', totalDeduction, 'Net pay:', netPay);

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
    }, [deductionSettings, events]);

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

    const handleMarkAsPaid = async (id: string) => {
        console.log('handleMarkAsPaid called with id:', id);
        const record = payrollRecords.find(p => p.id === id);
        console.log('Found record:', record);
        if (!record) return;

        try {
            const res = await fetch(`${ENV.API_URL}/payroll/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...record, status: 'paid' })
            });
            console.log('Mark as paid response:', res.status);

            if (res.ok) {
                const updated = await res.json();
                console.log('Updated record:', updated);
                setPayrollRecords(prev => prev.map(p =>
                    p.id === id ? { ...p, status: 'paid' } : p
                ));
            }
        } catch (e) {
            console.error('Failed to mark as paid:', e);
        }
    };

    const handleDeletePayroll = async () => {
        if (!showDeleteConfirm) return;

        setIsDeleting(true);
        console.log('Deleting payroll with id:', showDeleteConfirm);
        try {
            const res = await fetch(`${ENV.API_URL}/payroll/${showDeleteConfirm}`, {
                method: 'DELETE'
            });
            console.log('Delete response:', res.status);

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
        setEditStatus(record.status as 'pending' | 'paid');
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
    const processedCount = payrollRecords.filter(p => p.status === 'paid').length;

    const stats = [
        { title: 'Total Payroll', value: `₱ ${totalPayroll.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'This Period', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Avg Net Pay', value: `₱ ${avgNetPay.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'Per Employee', icon: Banknote, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Deductions', value: `₱ ${totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, sub: 'All Employees', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: 'Paid', value: processedCount.toString().padStart(2, '0'), sub: 'Employees', icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'pending': return <Clock className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    const currentPeriod = getCurrentPayrollPeriod();

    const handleExportCSV = () => {
        if (filteredRecords.length === 0) return;

        const headers = ['Employee', 'Position', '15-Day Salary', 'Late Count', 'Absent Count', 'Deductions', 'Net Pay', 'Period', 'Status'];
        const rows = filteredRecords.map(record => [
            record.full_name,
            record.position,
            record.base_salary.toFixed(2),
            record.late_count || 0,
            record.absent_count || 0,
            record.total_deduction || 0,
            record.net_pay.toFixed(2),
            record.period,
            record.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payroll_${currentPeriod.periodStr.replace(/\//g, '-')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Employee Payroll</h1>
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
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
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
                            className="flex items-center gap-1 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <option value="all" className="text-black">All Status</option>
                            <option value="pending" className="text-black">Pending</option>
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
                                                        record.status === 'paid' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                                    )}>
                                                        {getStatusIcon(record.status)}
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 overflow-visible">
                                                <div className="relative inline-block action-menu-button">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenActionMenu(openActionMenu === record.id ? null : record.id)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    {openActionMenu === record.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1 z-[200] action-menu-dropdown">
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Pay Slip clicked for record:', record.id);
                                                                    setPayslipRecord(record);
                                                                    setShowPayslip(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-secondary hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                Pay Slip
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleMarkAsPaid(record.id);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Mark as Paid
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditClick(record)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                            >
                                                                <Pencil className="w-4 h-4 text-secondary" />
                                                                Edit Deductions
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowDeleteConfirm(record.id);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
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
                                        onChange={(e) => setEditStatus(e.target.value as 'pending' | 'paid')}
                                        className="w-full px-3 py-2.5 bg-muted border border-gray-200 dark:border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-sm dark:[color-scheme:dark]"
                                    >
                                        <option value="pending">Pending</option>
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

            {/* Payslip Modal */}
            {showPayslip && payslipRecord && (
                <>
                    <style>{`
                        @media print {
                            body * { visibility: hidden; }
                            .print\\:block, .print\\:block * { visibility: visible; }
                            .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
                            body { margin: 0; padding: 0; }
                        }
                    `}</style>
                    {/* Screen Modal */}
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-lg w-full max-w-xs shadow-2xl border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-4 bg-secondary text-white">
                                <h3 className="text-xs font-bold uppercase tracking-widest">Pay Slip</h3>
                                <p className="text-[10px] opacity-80 mt-0.5">{formatPeriod(payslipRecord.period)}</p>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="pb-2 border-b border-gray-100 dark:border-white/10">
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Employee</div>
                                    <div className="text-sm font-bold text-foreground">{payslipRecord.full_name}</div>
                                    <div className="text-[10px] text-muted-foreground">{payslipRecord.position}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">15-Day Salary</span>
                                        <span className="text-xs font-bold text-foreground">₱ {payslipRecord.base_salary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Late ({payslipRecord.late_count || 0})</span>
                                        <span className="text-xs font-bold text-rose-500">-₱ {((payslipRecord.late_count || 0) * (deductionSettings?.late_deduction ?? 50)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Absent ({payslipRecord.absent_count || 0})</span>
                                        <span className="text-xs font-bold text-rose-500">-₱ {((payslipRecord.absent_count || 0) * (deductionSettings?.absent_deduction ?? 100)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/10">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Deductions</span>
                                        <span className="text-xs font-bold text-rose-500">-₱ {(payslipRecord.total_deduction || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Net Pay</div>
                                    <div className="text-lg font-bold text-foreground">
                                        ₱ {payslipRecord.net_pay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex justify-between">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-2 bg-gray-200 dark:bg-white/10 text-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer className="w-3 h-3" />
                                    Print
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPayslip(false);
                                        setPayslipRecord(null);
                                    }}
                                    className="px-4 py-2 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Print Layout - Hidden on screen, visible on print */}
                    <div className="hidden print:block">
                        <div className="w-[280px] mx-auto p-4 text-[10px] font-sans text-black">
                            <div className="text-center border-b-2 border-black pb-2 mb-3">
                                <h1 className="text-xs font-bold uppercase tracking-wider">Pay Slip</h1>
                                <p className="text-[9px] mt-0.5">{formatPeriod(payslipRecord.period)}</p>
                            </div>

                            <div className="mb-3 pb-2 border-b border-gray-300">
                                <p className="font-bold text-[11px]">{payslipRecord.full_name}</p>
                                <p className="text-[9px] text-gray-600">{payslipRecord.position}</p>
                            </div>

                            <div className="space-y-1.5 mb-3">
                                <div className="flex justify-between">
                                    <span className="font-bold uppercase">15-Day Salary</span>
                                    <span className="font-bold">₱ {payslipRecord.base_salary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="uppercase">Late ({payslipRecord.late_count || 0})</span>
                                    <span className="text-red-600">-₱ {((payslipRecord.late_count || 0) * (deductionSettings?.late_deduction ?? 50)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="uppercase">Absent ({payslipRecord.absent_count || 0})</span>
                                    <span className="text-red-600">-₱ {((payslipRecord.absent_count || 0) * (deductionSettings?.absent_deduction ?? 100)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-300">
                                    <span className="font-bold uppercase">Total Deductions</span>
                                    <span className="text-red-600 font-bold">-₱ {(payslipRecord.total_deduction || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="border-t-2 border-black pt-2">
                                <div className="text-center">
                                    <span className="font-bold uppercase text-[9px]">Net Pay</span>
                                    <p className="text-lg font-bold">₱ {payslipRecord.net_pay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div className="text-center mt-4 pt-2 border-t border-gray-300">
                                <p className="text-[8px] text-gray-500">Generated on {new Date().toLocaleDateString('en-PH')}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollPage;
