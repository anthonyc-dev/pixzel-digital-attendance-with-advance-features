'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Percent,
    Save,
    Loader2,
    UserX,
    Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/api';

interface DeductionSetting {
    id: number;
    late_deduction: number;
    absent_deduction: number;
    created_at: string;
}

const DeductionSettingsPage = () => {
    const [current, setCurrent] = useState<DeductionSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [lateVal, setLateVal] = useState('');
    const [absentVal, setAbsentVal] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ENV.API_URL}/deduction-settings`);

            if (res.ok) {
                const data: DeductionSetting = await res.json();
                setCurrent(data);
                setLateVal(String(data.late_deduction));
                setAbsentVal(String(data.absent_deduction));
            }
        } catch (e) {
            console.error('Failed to fetch deduction settings:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!lateVal || !absentVal) return;
        setSaving(true);
        try {
            const res = await fetch(`${ENV.API_URL}/deduction-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    late_deduction: parseFloat(lateVal),
                    absent_deduction: parseFloat(absentVal),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCurrent(data);
                toast.success('Deduction rates saved successfully!');
                await fetchSettings();
            }
        } catch (e) {
            console.error('Failed to save deduction settings:', e);
            toast.error('Failed to save deduction settings.');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges =
        current &&
        (parseFloat(lateVal) !== current.late_deduction ||
            parseFloat(absentVal) !== current.absent_deduction);

    return (
        <div className="flex flex-col gap-6 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Deduction Settings</h1>
                    </div>
                    <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                        Configure per-unit deduction rates applied during payroll computation
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">

                {/* ── Editor Panel ── */}
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Percent className="w-4 h-4 text-secondary" />
                        <h2 className="text-sm font-bold tracking-tight text-foreground">Set Deduction Rates</h2>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Late deduction */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Timer className="w-3 h-3 text-amber-500" />
                                    Late Arrival — Deduction per Occurrence
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm select-none">₱</span>
                                    <input
                                        id="late-deduction-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={lateVal}
                                        onChange={(e) => setLateVal(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all tabular-nums"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Deducted once per day the employee is recorded as <strong>late</strong>.
                                </p>
                            </div>

                            {/* Absent deduction */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <UserX className="w-3 h-3 text-rose-500" />
                                    Absent Day — Deduction per Day
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm select-none">₱</span>
                                    <input
                                        id="absent-deduction-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={absentVal}
                                        onChange={(e) => setAbsentVal(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all tabular-nums"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Deducted once per day the employee is marked as <strong>absent</strong>.
                                </p>
                            </div>

                            {/* Save button — right aligned, compact */}
                            <div className="flex md:justify-end justify-center mt-4">
                                <button
                                    id="save-deduction-settings"
                                    onClick={handleSave}
                                    disabled={saving || !hasChanges}
                                    className={cn(
                                        'flex items-center justify-center gap-2 px-4 w-full sm:w-auto py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all shadow-lg bg-secondary text-white shadow-secondary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                >
                                    {saving ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></>
                                    ) : (
                                        <><Save className="w-3.5 h-3.5" /><span>Save Deduction Rates</span></>
                                    )}
                                </button>
                            </div>

                            {!hasChanges && current && (
                                <p className="text-center text-[10px] text-muted-foreground">
                                    Rates are up to date — no changes detected.
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeductionSettingsPage;
