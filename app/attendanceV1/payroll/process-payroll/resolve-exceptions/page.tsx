'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

const initialExceptions = [
  { id: 'EX-001', employeeId: 'EMP007', name: 'James Rodriguez', issue: 'Missing timeout', impact: 0, status: 'open' },
  { id: 'EX-002', employeeId: 'EMP003', name: 'Robert Chen', issue: 'Leave mismatch', impact: -500, status: 'open' },
  { id: 'EX-003', employeeId: 'EMP001', name: 'John Michael Santos', issue: 'OT discrepancy', impact: 250, status: 'resolved' },
];

export default function ResolveExceptions() {
  const [rows, setRows] = useState(initialExceptions);

  const markResolved = (id: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Resolve Exceptions</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Review payroll blockers and resolve them before finalization.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Open Exceptions</p><p className="text-2xl font-bold mt-1">{rows.filter((r) => r.status === 'open').length}</p></div>
            <Clock className="w-6 h-6 text-amber-500" />
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold mt-1">{rows.filter((r) => r.status === 'resolved').length}</p></div>
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Exception Queue</CardTitle>
          <CardDescription className="dark:text-gray-400">Resolve entries to continue payroll processing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead className="text-right">Impact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.employeeId}</p>
                  </TableCell>
                  <TableCell>{row.issue}</TableCell>
                  <TableCell className="text-right">{row.impact === 0 ? '-' : `P${Math.abs(row.impact).toLocaleString()}`}</TableCell>
                  <TableCell><Badge variant={row.status === 'resolved' ? 'default' : 'secondary'}>{row.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" disabled={row.status === 'resolved'} onClick={() => markResolved(row.id)}>
                      Mark resolved
                    </Button>
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