'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const calculatedRows = [
  { employeeId: 'EMP001', name: 'John Michael Santos', gross: 45000, deductions: 8200, net: 36800, status: 'ok' },
  { employeeId: 'EMP002', name: 'Maria Clara Rivera', gross: 38000, deductions: 5700, net: 32300, status: 'ok' },
  { employeeId: 'EMP003', name: 'Robert Chen', gross: 52000, deductions: 10300, net: 41700, status: 'needs_review' },
];

export default function ReviewAutoCalculations() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () =>
      calculatedRows.filter(
        (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Review Auto-Calculations</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Validate computed gross, deductions, and net pay before exceptions step.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-2xl font-bold mt-1">{calculatedRows.length}</p></CardContent></Card>
        <Card className="dark:bg-black dark:border-white/10"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Gross</p><p className="text-2xl font-bold mt-1">P{calculatedRows.reduce((a, b) => a + b.gross, 0).toLocaleString()}</p></CardContent></Card>
        <Card className="dark:bg-black dark:border-white/10"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Net</p><p className="text-2xl font-bold mt-1">P{calculatedRows.reduce((a, b) => a + b.net, 0).toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Calculation Results</CardTitle>
          <CardDescription className="dark:text-gray-400">Review each employee for potential mismatches.</CardDescription>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.employeeId}</p>
                  </TableCell>
                  <TableCell className="text-right">P{row.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right">P{row.deductions.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">P{row.net.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'ok' ? 'default' : 'secondary'}>
                      {row.status === 'ok' ? 'Ready' : 'Needs review'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}