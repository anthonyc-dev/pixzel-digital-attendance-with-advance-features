'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

export default function LoanTerms() {
  const [name, setName] = useState('');
  const [maxMonths, setMaxMonths] = useState('12');
  const [maxAmount, setMaxAmount] = useState('0');
  const [interestRate, setInterestRate] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [rows, setRows] = useState([
    { id: 1, name: 'Salary Advance', maxMonths: 12, maxAmount: 50000, interestRate: 0, isActive: true },
    { id: 2, name: 'Emergency Loan', maxMonths: 18, maxAmount: 100000, interestRate: 2.5, isActive: true },
  ]);

  const addTerm = () => {
    if (!name) return;
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        maxMonths: Number(maxMonths) || 0,
        maxAmount: Number(maxAmount) || 0,
        interestRate: Number(interestRate) || 0,
        isActive,
      },
    ]);
    setName('');
    setMaxMonths('12');
    setMaxAmount('0');
    setInterestRate('0');
    setIsActive(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Loan Terms</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Manage loan products and borrowing limits.</p>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Create Loan Term</CardTitle>
          <CardDescription className="dark:text-gray-400">Define limits and rates per loan type.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label>Term Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cash Advance" />
          </div>
          <div className="space-y-2">
            <Label>Max Months</Label>
            <Input type="number" value={maxMonths} onChange={(e) => setMaxMonths(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Max Amount</Label>
            <Input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Interest (%)</Label>
            <Input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} step="0.01" />
          </div>
          <div className="space-y-2">
            <Label>Active</Label>
            <div className="h-10 flex items-center"><Switch checked={isActive} onCheckedChange={setIsActive} /></div>
          </div>
          <div className="md:col-span-5">
            <Button onClick={addTerm} className="bg-secondary hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Loan Term
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Loan Term List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Max Months</TableHead>
                <TableHead>Max Amount</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.maxMonths}</TableCell>
                  <TableCell>P{r.maxAmount.toLocaleString()}</TableCell>
                  <TableCell>{r.interestRate}%</TableCell>
                  <TableCell>{r.isActive ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}