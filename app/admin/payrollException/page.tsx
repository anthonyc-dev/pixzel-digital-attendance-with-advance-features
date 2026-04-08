'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  FileWarning,
  History
} from 'lucide-react';
import { toast } from 'sonner';

interface PayrollException {
    id: string;
    employee_name: string;
    leave_period: string;
    submission_date: string;
    late_days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Adjusted';
}

const MOCK_EXCEPTIONS: PayrollException[] = [
    { id: 'EX-001', employee_name: 'Alice Johnson', leave_period: 'Mar 15 - Mar 17', submission_date: '2026-04-05', late_days: 15, reason: 'Late submission of medical certificate', status: 'Pending' },
    { id: 'EX-002', employee_name: 'Bob Smith', leave_period: 'Mar 20 - Mar 21', submission_date: '2026-04-02', late_days: 10, reason: 'Family emergency, forgot to file', status: 'Pending' },
    { id: 'EX-003', employee_name: 'Charlie Davis', leave_period: 'Mar 01 - Mar 05', submission_date: '2026-04-01', late_days: 25, reason: 'System access issues', status: 'Approved' },
];

const PayrollException = () => {
    const [exceptions, setExceptions] = useState(MOCK_EXCEPTIONS);

    const handleApprove = (id: string) => {
        setExceptions(prev => prev.map(ex => 
            ex.id === id ? { ...ex, status: 'Approved' } : ex
        ));
        toast.success('Exception approved for payroll adjustment!');
    };

    return (
        <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Payroll Exceptions
                    </h1>
                    <p className="text-muted-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] leading-none opacity-80">
                        Handle late leave submissions and manual synchronization
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm hover:bg-gray-50 transition-all">
                        <History className="w-3.5 h-3.5" />
                        <span>View History</span>
                    </button>
                </div>
            </header>

            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Late Submissions Detected</h3>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/60 leading-relaxed font-medium">
                        The following leave requests were submitted after the cutoff date. Approved exceptions will be automatically queued for the next payroll adjustment cycle.
                    </p>
                </div>
            </div>

            {/* Exceptions List */}
            <section className="grid grid-cols-1 gap-4">
                {exceptions.map((ex) => (
                    <div 
                        key={ex.id}
                        className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:border-secondary/30"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20">
                                    <FileWarning className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-secondary transition-colors">{ex.employee_name}</h3>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            ex.status === 'Pending' && "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                                            ex.status === 'Approved' && "bg-green-500/10 text-green-600 border border-green-500/20"
                                        )}>
                                            {ex.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">{ex.leave_period}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-black italic">{ex.late_days} Days Late</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Submitted: {ex.submission_date}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground/80 font-medium italic">
                                        &quot;{ex.reason}&quot;
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 self-end md:self-center">
                                {ex.status === 'Pending' ? (
                                    <button 
                                        onClick={() => handleApprove(ex.id)}
                                        className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer"
                                    >
                                        <span>Approve for Adjustment</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Ready for Next Payroll</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {exceptions.length === 0 && (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-white dark:bg-white/2 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                        <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No pending exceptions found</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PayrollException;