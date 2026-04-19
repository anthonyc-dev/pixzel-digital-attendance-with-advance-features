'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default function PayrollPeriods() {
  const [label, setLabel] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [rows, setRows] = useState([
    { id: 1, label: 'April 1-15, 2026', start: '2026-04-01', end: '2026-04-15', status: 'open' },
    { id: 2, label: 'March 16-31, 2026', start: '2026-03-16', end: '2026-03-31', status: 'closed' },
  ]);

  const addPeriod = () => {
    if (!label || !start || !end) return;
    setRows((prev) => [...prev, { id: Date.now(), label, start, end, status: 'open' }]);
    setLabel('');
    setStart('');
    setEnd('');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Payroll Periods</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Create and manage payroll period definitions.</p>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Add Period</CardTitle>
          <CardDescription className="dark:text-gray-400">Define period label and date range.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="April 16-30, 2026" />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={addPeriod} className="w-full bg-secondary hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Period
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Configured Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>{row.start}</TableCell>
                  <TableCell>{row.end}</TableCell>
                  <TableCell><Badge variant={row.status === 'open' ? 'default' : 'secondary'}>{row.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}