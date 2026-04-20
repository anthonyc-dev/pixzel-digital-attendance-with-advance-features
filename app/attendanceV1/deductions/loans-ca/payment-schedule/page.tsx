'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { employees } from '@/lib/mock-data';

const mockSchedule = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", type: "Salary Advance", amount: 50000, remaining: 35000, nextPayment: "2026-05-01", monthlyPayment: 5000 },
  { id: 2, employeeId: "EMP003", name: "Robert Chen", type: "Emergency Loan", amount: 30000, remaining: 18000, nextPayment: "2026-05-15", monthlyPayment: 3000 },
];

export default function PaymentSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Payment Schedule</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Upcoming loan payment schedule</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Deductions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱8,000</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">2</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">2</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="dark:text-white">Upcoming Payments</CardTitle>
            <CardDescription className="dark:text-gray-400">Payment schedule for the next 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-white/5 hover:bg-transparent">
                <TableHead className="dark:text-gray-400">Employee</TableHead>
                <TableHead className="dark:text-gray-400">Loan Type</TableHead>
                <TableHead className="dark:text-gray-400">Remaining Balance</TableHead>
                <TableHead className="dark:text-gray-400">Next Payment</TableHead>
                <TableHead className="dark:text-gray-400">Monthly Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSchedule.map((schedule) => (
                <TableRow key={schedule.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div>
                      <p className="font-medium dark:text-white">{schedule.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">{schedule.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{schedule.type}</TableCell>
                  <TableCell className="dark:text-gray-300">₱{schedule.remaining.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {new Date(schedule.nextPayment).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium dark:text-white">₱{schedule.monthlyPayment.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}