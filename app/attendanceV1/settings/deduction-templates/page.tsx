'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';

export default function DeductionTemplates() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [defaultAmount, setDefaultAmount] = useState('0');
  const handleFrequencyChange = (value: string | null) => {
    setFrequency(value ?? 'monthly');
  };
  const [templates, setTemplates] = useState([
    { id: 1, code: 'SSS', name: 'SSS Contribution', frequency: 'monthly', defaultAmount: 1200 },
    { id: 2, code: 'PHILHEALTH', name: 'PhilHealth Contribution', frequency: 'monthly', defaultAmount: 800 },
  ]);

  const addTemplate = () => {
    if (!code || !name) return;
    setTemplates((prev) => [
      ...prev,
      { id: Date.now(), code, name, frequency, defaultAmount: Number(defaultAmount) || 0 },
    ]);
    setCode('');
    setName('');
    setFrequency('monthly');
    setDefaultAmount('0');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Deduction Templates</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Configure reusable payroll deduction definitions.</p>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Create Template</CardTitle>
          <CardDescription className="dark:text-gray-400">Set up deduction defaults for assignment to employees.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PAGIBIG" />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pag-IBIG Contribution" />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semi_monthly">Semi-monthly</SelectItem>
                <SelectItem value="one_time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Amount</Label>
            <Input type="number" value={defaultAmount} onChange={(e) => setDefaultAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={addTemplate} className="w-full bg-secondary hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Template List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Default Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.frequency}</TableCell>
                  <TableCell className="text-right">P{row.defaultAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}