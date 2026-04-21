'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Banknote, Plus, Search, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LoanRow {
  id: string;
  loan_type: string;
  principal_amount: number;
  remaining_balance: number;
  monthly_payment: number;
  status: string;
  employer_registration?: { employer_name?: string; employer_id?: string };
}

function formatPeso(n: number) {
  return `₱${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function loanDisplayId(id: string) {
  const compact = id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return compact ? `LN-${compact}` : 'LN';
}

function humanizeLoanType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function loanProgress(principal: number, remaining: number) {
  const p = Math.max(0, Number(principal) || 0);
  const r = Math.max(0, Number(remaining) || 0);
  const paid = Math.max(0, p - r);
  const pct = p > 0 ? Math.min(100, (paid / p) * 100) : 0;
  return { paid, principal: p, remaining: r, pct };
}

export default function ActiveLoansPage() {
  const [rows, setRows] = useState<LoanRow[]>([]);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState<LoanRow | null>(null);
  const [removing, setRemoving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const name = r.employer_registration?.employer_name?.toLowerCase() ?? '';
      const lid = loanDisplayId(r.id).toLowerCase();
      const type = r.loan_type.toLowerCase();
      return name.includes(q) || lid.includes(q) || type.includes(q);
    });
  }, [rows, search]);

  const load = useCallback(async () => {
    const res = await fetch('/api/loan-accounts?status=active', {
      cache: 'no-store',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? 'Could not load loans');
      return;
    }
    const d = await res.json();
    setRows(Array.isArray(d) ? d : []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/loan-accounts/${removeTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? 'Failed to remove loan');
        return;
      }
      toast.success('Loan removed');
      setRemoveTarget(null);
      await load();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Loans & CA</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Repayment progress compares amount paid (principal minus remaining) to the original principal. Remove a loan only if it was created by mistake or reversed outside the system.
            </p>
          </div>
          <Link
            href="/admin/deductions/loans-ca/add-new-loan"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'default' }),
              'shrink-0 inline-flex'
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new loan
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center text-sm text-muted-foreground">No active loans.</div>
        ) : (
          <div className="space-y-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Search loans…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                aria-label="Search loans"
              />
            </div>

            <div className="rounded-2xl border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="p-4 font-medium">Employee</th>
                    <th className="p-4 font-medium min-w-[220px]">Loan progress</th>
                    <th className="p-4 font-medium">Installment</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const { paid, principal, pct } = loanProgress(
                      r.principal_amount,
                      r.remaining_balance
                    );
                    const monthly = Number(r.monthly_payment ?? 0);
                    return (
                      <tr key={r.id} className="border-t align-top">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary"
                              aria-hidden
                            >
                              <Banknote className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">
                                {r.employer_registration?.employer_name ?? '—'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {loanDisplayId(r.id)}
                                <span className="mx-1.5 text-border">·</span>
                                {humanizeLoanType(r.loan_type)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
                            <span className="font-semibold text-secondary tabular-nums">{formatPeso(paid)}</span>
                            <span className="text-muted-foreground">of</span>
                            <span className="font-medium tabular-nums text-foreground">{formatPeso(principal)}</span>
                          </div>
                          <div
                            className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-valuenow={Math.round(pct)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="h-full rounded-full bg-secondary transition-[width]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold italic tabular-nums text-base">
                            {monthly > 0 ? `${formatPeso(monthly)} / mo` : '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            aria-label="Remove loan"
                            onClick={() => setRemoveTarget(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground border-t">No loans match your search.</p>
              )}
            </div>
          </div>
        )}

        <AlertDialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this loan?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the loan for{' '}
                <strong>{removeTarget?.employer_registration?.employer_name ?? 'this employee'}</strong>
                {removeTarget?.principal_amount != null && (
                  <>
                    {' '}
                    (principal {formatPeso(Number(removeTarget.principal_amount))})
                  </>
                )}
                . Only use for mistaken duplicates or reversed advances.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={removing}
                onClick={(e) => {
                  e.preventDefault();
                  void confirmRemove();
                }}
              >
                {removing ? 'Removing…' : 'Remove loan'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
