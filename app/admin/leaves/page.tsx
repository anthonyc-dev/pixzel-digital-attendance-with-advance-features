'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';
import { CalendarDays, Trash2, X, AlertCircle, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';

interface LeaveRequest {
    id: number;
    employee_name: string;
    employer_id?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    created_at: string;
    image?: string;
}

interface Employer {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
}

const LEAVE_TYPES = [
    'Paid Leave',
    'Unpaid Leave',
    'Statutory / Mandatory Leave',
    'Personal Leave',
    'Medical Leave',
    'Special Leave',
    'Work-Related Leave',
    'Partial Leave',
];

const LeavesPage = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const search = '';
    const filteredLeaves = useMemo(() => {
        if (!search.trim()) return leaves;
        const term = search.toLowerCase();
        return leaves.filter(leave => 
            leave.employee_name.toLowerCase().includes(term) ||
            leave.leave_type.toLowerCase().includes(term)
        );
    }, [leaves]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'delete' } | null>(null);
    const [formData, setFormData] = useState({
        employer_id: '',
        leave_type: '',
        reason: '',
        start_date: '',
        end_date: '',
    });

    const showToast = (message: string, type: 'success' | 'error' | 'delete') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ENV.API_URL}/leave`);
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
                console.log('Leaves Data:', data);
            }
        } catch (e) {
            console.error('Failed to fetch leaves:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployers = async () => {
        try {
            const res = await fetch(`${ENV.API_URL}/registration`);
            if (res.ok) {
                const result = await res.json();
                const employersData = result.data || result || [];
                setEmployers(employersData);
                console.log('Employers Data:', employersData);
            }
        } catch (e) {
            console.error('Failed to fetch employers:', e);
        }
    };

    useEffect(() => {
        fetchLeaves();
        fetchEmployers();
    }, []);

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        const id = showDeleteConfirm;
        setIsDeleting(id);
        try {
            const res = await fetch(`${ENV.API_URL}/leave/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLeaves(prev => prev.filter(l => l.id !== id));
                showToast('Leave request removed successfully', 'delete');
            } else {
                showToast('Failed to delete leave request', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Error deleting leave request', 'error');
        } finally {
            setIsDeleting(null);
            setShowDeleteConfirm(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${ENV.API_URL}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast('Leave request submitted successfully!', 'success');
                setIsModalOpen(false);
                setFormData({ employer_id: '', leave_type: '', reason: '', start_date: '', end_date: '' });
                await fetchLeaves();
            } else {
                const error = await res.json();
                showToast(error.error || 'Failed to submit leave request', 'error');
            }
        } catch (e) {
            console.error('Failed to submit leave:', e);
            showToast('Failed to submit leave request', 'error');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <>
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full mx-auto max-w-7xl animate-in fade-in duration-200 ease-out pb-4 sm:pb-6 lg:pb-10">
                <header className="flex flex-wrap items-start sm:items-end justify-between gap-2 sm:gap-4">
                    <div className="space-y-0.5 sm:space-y-1">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Leaves</h1>
                        <p className="text-muted-foreground text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                            Manage employee leave requests
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all"
                    >
                        <span>Request Leave</span>
                    </button>
                </header>

                <section className="flex flex-col gap-4 sm:gap-6 flex-1 min-h-0">
                    <div className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg overflow-hidden shadow-xl overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-24 whitespace-nowrap">ID</th>
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 min-w-[120px] whitespace-nowrap">Employee</th>
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Leave Type</th>
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">Start Date</th>
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 whitespace-nowrap">End Date</th>
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 min-w-[150px] whitespace-nowrap">Reason</th>
                                    <th className="px-4 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-white/5 w-16 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading ? (
                                    <>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <tr key={i}>
                                                {Array.from({ length: 6 }).map((_, idx) => (
                                                    <td key={idx} className="px-4 py-2 border-l border-gray-100 dark:border-white/5">
                                                        <div className="h-3 w-full bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 text-center">
                                                    <div className="h-3 w-8 bg-gray-200 dark:bg-white/5 rounded animate-pulse mx-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ) : filteredLeaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <CalendarDays className="w-8 h-8 opacity-50" />
                                                <span className="text-xs font-bold uppercase tracking-widest">No leaves found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeaves.map((leave) => (
                                        <tr 
                                            key={leave.id}
                                            className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all border-b border-gray-100 dark:border-white/5 last:border-0 h-fit"
                                        >
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{leave.id}</span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                                                <span className="text-xs sm:text-sm font-bold text-foreground leading-none tracking-tight group-hover:text-secondary transition-colors block max-w-[120px] truncate" title={leave.employee_name}>{leave.employee_name}</span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 block truncate" title={leave.leave_type}>{leave.leave_type}</span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle whitespace-nowrap">
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">{leave.start_date}</span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle whitespace-nowrap">
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">{leave.end_date}</span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 align-middle">
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 block max-w-[150px] truncate" title={leave.reason}>{leave.reason}</span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100 dark:border-white/5 relative align-middle text-center min-w-[70px]">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteConfirm(leave.id);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Request Leave Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-foreground">Request Leave</h2>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Employee
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.employer_id}
                                        onChange={(e) => setFormData({ ...formData, employer_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select employee</option>
                                        {employers.map((emp) => (
                                            <option key={emp.id} value={emp.employer_id}>
                                                {emp.employer_name} - {emp.employer_id}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Leave Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select leave type</option>
                                        {LEAVE_TYPES.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Reason
                                </label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Enter reason for leave"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all resize-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all shadow-lg w-full bg-secondary text-white shadow-secondary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Submitting...</span></>
                                ) : (
                                    <><span>Submit Request</span></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight text-foreground">Confirm Deletion</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                    Are you sure you want to remove this leave request? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!!isDeleting}
                                    className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md",
                        toast.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
                        toast.type === 'delete' && "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
                        toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                    )}>
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                        {toast.type === 'delete' && <Trash2 className="w-5 h-5" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LeavesPage;
