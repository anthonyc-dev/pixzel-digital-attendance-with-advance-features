'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, CalendarDays, Plus, Wallet } from 'lucide-react';

export default function AddNewLoan() {
  const [loanType, setLoanType] = useState('salary_advance');
  const [employeeId, setEmployeeId] = useState('');
  const [principal, setPrincipal] = useState('0');
  const [termMonths, setTermMonths] = useState('12');
  const [interestRate, setInterestRate] = useState('0');
  const [startDate, setStartDate] = useState('');
  const handleLoanTypeChange = (value: string | null) => {
    setLoanType(value ?? '');
  };

  const p = Number(principal) || 0;
  const t = Number(termMonths) || 1;
  const i = (Number(interestRate) || 0) / 100;

  const monthlyPayment = useMemo(() => {
    if (!p || !t) return 0;
    return (p * (1 + i)) / t;
  }, [p, t, i]);

  const schedulePreview = useMemo(
    () =>
      Array.from({ length: Math.min(t, 6) }, (_, index) => ({
        installment: index + 1,
        amount: monthlyPayment,
      })),
    [t, monthlyPayment],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Add New Loan</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Create a loan or cash advance profile and preview installments.</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90">
          <Plus className="w-4 h-4 mr-2" />
          Save Loan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Principal</p>
              <p className="text-2xl font-bold mt-1 dark:text-white">P{p.toLocaleString()}</p>
            </div>
            <Wallet className="w-6 h-6 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Monthly Payment</p>
              <p className="text-2xl font-bold mt-1 dark:text-white">P{monthlyPayment.toFixed(2)}</p>
            </div>
            <Calculator className="w-6 h-6 text-green-500" />
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Term</p>
              <p className="text-2xl font-bold mt-1 dark:text-white">{t} months</p>
            </div>
            <CalendarDays className="w-6 h-6 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Loan Information</CardTitle>
          <CardDescription className="dark:text-gray-400">Fill out required details for loan creation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Employee ID</Label>
            <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP001" />
          </div>
          <div className="space-y-2">
            <Label>Loan Type</Label>
            <Select value={loanType} onValueChange={handleLoanTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="salary_advance">Salary Advance</SelectItem>
                <SelectItem value="cash_advance">Cash Advance</SelectItem>
                <SelectItem value="emergency_loan">Emergency Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Principal Amount</Label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} min="0" />
          </div>
          <div className="space-y-2">
            <Label>Term (Months)</Label>
            <Input type="number" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} min="1" />
          </div>
          <div className="space-y-2">
            <Label>Interest Rate (%)</Label>
            <Input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} min="0" step="0.01" />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Payment Schedule Preview</CardTitle>
          <CardDescription className="dark:text-gray-400">First six installments based on current inputs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Installment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedulePreview.map((row) => (
                <TableRow key={row.installment}>
                  <TableCell>#{row.installment}</TableCell>
                  <TableCell>P{row.amount.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="secondary">Scheduled</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}