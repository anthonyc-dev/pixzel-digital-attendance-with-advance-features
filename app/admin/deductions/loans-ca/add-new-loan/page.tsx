'use client';

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Employer { id: number; employer_name: string; employer_id: string }

const fieldClass =
  'px-3 py-2 rounded border bg-white text-black placeholder:text-neutral-500 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 border-gray-300 dark:border-white/20';

/** Native date inputs: OS calendar glyph is often dark-on-dark without scheme + indicator tweaks. */
const dateFieldClass = `${fieldClass} [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-moz-calendar-picker-indicator]:cursor-pointer [&::-moz-calendar-picker-indicator]:opacity-100 [&::-moz-calendar-picker-indicator]:dark:invert`;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Calendar months from start → end for equal monthly principal (0% interest helper). Min 1. */
function paymentMonthsBetween(startISO: string, endISO: string): number {
  const s = new Date(`${startISO}T12:00:00`);
  const e = new Date(`${endISO}T12:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;
  if (e <= s) return 1;
  let m =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() < s.getDate()) m -= 1;
  return Math.max(1, m);
}

/** End date = start + n whole months (same calendar day when possible). */
function addMonths(iso: string, n: number): string {
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1 + n, d);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

type ScheduleMode = 'payment' | 'end';

export default function AddNewLoanPage() {
  const [employees, setEmployees] = useState<Employer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('payment');
  const [form, setForm] = useState({
    employer_registration_id: '',
    loan_type: 'salary_advance',
    principal_amount: '',
    monthly_payment: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/registration', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setEmployees(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(() => setEmployees([]));
  }, []);

  const recomputeFromPayment = (base: typeof form) => {
    const P = Number(base.principal_amount);
    const M = Number(base.monthly_payment);
    const S = base.start_date;
    if (P > 0 && M > 0 && S) {
      const months = Math.max(1, Math.ceil(P / M));
      return { ...base, end_date: addMonths(S, months) };
    }
    return base;
  };

  const recomputeFromEnd = (base: typeof form) => {
    const P = Number(base.principal_amount);
    const S = base.start_date;
    const E = base.end_date;
    if (P > 0 && S && E) {
      const months = paymentMonthsBetween(S, E);
      return { ...base, monthly_payment: String(round2(P / months)) };
    }
    return base;
  };

  const submit = async () => {
    if (isSubmitting) return;
    if (!form.employer_registration_id || !form.principal_amount || !form.start_date) {
      toast.error('Select an employee, principal, and start date.');
      return;
    }
    const principal = Number(form.principal_amount);
    const monthly = Number(form.monthly_payment || 0);
    let end = form.end_date || null;
    let termMonths: number | null = null;
    if (form.start_date && end) {
      termMonths = paymentMonthsBetween(form.start_date, end);
    } else if (principal > 0 && monthly > 0) {
      termMonths = Math.max(1, Math.ceil(principal / monthly));
      end = addMonths(form.start_date, termMonths);
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/loan-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          employer_registration_id: Number(form.employer_registration_id),
          loan_type: form.loan_type,
          principal_amount: principal,
          disbursed_amount: principal,
          remaining_balance: principal,
          monthly_payment: monthly || null,
          term_months: termMonths,
          start_date: form.start_date,
          end_date: end,
          status: 'active',
          notes: form.notes,
        }),
      });
      const errJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof errJson.error === 'string' ? errJson.error : 'Could not create loan');
        return;
      }
      toast.success('Loan created');
      setForm({
        employer_registration_id: '',
        loan_type: 'salary_advance',
        principal_amount: '',
        monthly_payment: '',
        start_date: '',
        end_date: '',
        notes: '',
      });
      setScheduleMode('payment');
    } catch {
      toast.error('Network error — try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Loan</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        <strong>End date</strong> is the expected payoff date. Enter <strong>monthly payment</strong> and we set end date from principal (equal installments, no interest in this calculator). Or set <strong>end date</strong> and we derive monthly payment.
      </p>
      <div className="p-4 rounded-2xl border grid md:grid-cols-2 gap-x-4 gap-y-5">
        <div className="space-y-2 min-w-0">
          <Label htmlFor="loan-employee">Employee</Label>
          <select
            id="loan-employee"
            className={`${fieldClass} w-full`}
            value={form.employer_registration_id}
            onChange={(e) => setForm((p) => ({ ...p, employer_registration_id: e.target.value }))}
          >
            <option value="">Select an employee</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.employer_name} ({e.employer_id})</option>)}
          </select>
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="loan-type">Loan type</Label>
          <select
            id="loan-type"
            className={`${fieldClass} w-full`}
            value={form.loan_type}
            onChange={(e) => setForm((p) => ({ ...p, loan_type: e.target.value }))}
          >
            <option value="salary_advance">Salary advance</option>
            <option value="cash_advance">Cash advance</option>
            <option value="emergency_loan">Emergency loan</option>
          </select>
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="loan-principal">Principal amount</Label>
          <input
            id="loan-principal"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            aria-describedby="loan-principal-hint"
            value={form.principal_amount}
            onChange={(e) => {
              const v = e.target.value;
              setForm((prev) => {
                const next = { ...prev, principal_amount: v };
                return scheduleMode === 'payment' ? recomputeFromPayment(next) : recomputeFromEnd(next);
              });
            }}
            className={`${fieldClass} w-full`}
          />
          <p id="loan-principal-hint" className="text-xs text-muted-foreground">
            Total amount borrowed. Required.
          </p>
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="loan-monthly">Monthly payment</Label>
          <input
            id="loan-monthly"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            aria-describedby="loan-monthly-hint"
            value={form.monthly_payment}
            onChange={(e) => {
              setScheduleMode('payment');
              const v = e.target.value;
              setForm((prev) => recomputeFromPayment({ ...prev, monthly_payment: v }));
            }}
            className={`${fieldClass} w-full`}
          />
          <p id="loan-monthly-hint" className="text-xs text-muted-foreground">
            Deduction per month. If you fill this, <strong>expected end date</strong> updates automatically.
          </p>
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="loan-start">Start date</Label>
          <input
            id="loan-start"
            type="date"
            aria-describedby="loan-start-hint"
            value={form.start_date}
            onChange={(e) => {
              const v = e.target.value;
              setForm((prev) => {
                const next = { ...prev, start_date: v };
                return scheduleMode === 'payment' ? recomputeFromPayment(next) : recomputeFromEnd(next);
              });
            }}
            className={`${dateFieldClass} w-full`}
          />
          <p id="loan-start-hint" className="text-xs text-muted-foreground">
            First deduction / loan start. Required.
          </p>
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="loan-end">Expected end date (payoff)</Label>
          <input
            id="loan-end"
            type="date"
            aria-describedby="loan-end-hint"
            value={form.end_date}
            onChange={(e) => {
              setScheduleMode('end');
              const v = e.target.value;
              setForm((prev) => recomputeFromEnd({ ...prev, end_date: v }));
            }}
            className={`${dateFieldClass} w-full`}
          />
          <p id="loan-end-hint" className="text-xs text-muted-foreground">
            Last payment date. If you pick this instead, <strong>monthly payment</strong> is calculated from principal.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2 min-w-0">
          <Label htmlFor="loan-notes">Notes</Label>
          <textarea
            id="loan-notes"
            placeholder="Optional details (reference no., terms, etc.)"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className={`${fieldClass} w-full min-h-24`}
            rows={4}
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-lg bg-secondary text-white font-semibold text-sm w-full sm:w-auto transition-colors hover:bg-secondary/90 disabled:opacity-60 disabled:pointer-events-none disabled:hover:bg-secondary"
          >
            {isSubmitting ? 'Creating…' : 'Create loan'}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            The button locks while saving so double-clicks do not create duplicate loans.
          </p>
        </div>
      </div>
    </div>
  );
}
