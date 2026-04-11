'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Plus,
  RotateCw,
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';

const mockAdjustments = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", type: "Bonus", amount: 5000, reason: "Performance bonus", adjustedBy: "HR Manager", date: "2026-04-10" },
  { id: 2, employeeId: "EMP003", name: "Robert Chen", type: "Allowance", amount: 2000, reason: "Transportation allowance", adjustedBy: "Admin", date: "2026-04-08" },
  { id: 3, employeeId: "EMP002", name: "Maria Clara Rivera", type: "Deduction", amount: -1500, reason: "Overpayment recovery", adjustedBy: "Finance", date: "2026-04-05" },
];

export default function PayrollAdjustmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAdjustments = mockAdjustments.filter(adj => {
    return adj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           adj.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPositive = mockAdjustments.filter(a => a.amount > 0).reduce((acc, a) => acc + a.amount, 0);
  const totalNegative = mockAdjustments.filter(a => a.amount < 0).reduce((acc, a) => acc + Math.abs(a.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Payroll Adjustments</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Manage payroll adjustments and additions</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Adjustments</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockAdjustments.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <RotateCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Additions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalPositive.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Deductions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalNegative.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Adjustment Records</CardTitle>
              <CardDescription className="dark:text-gray-400">All payroll adjustments</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search employee..." 
                className="pl-9 w-full sm:w-64 dark:bg-white/5 dark:border-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-white/5 hover:bg-transparent">
                <TableHead className="dark:text-gray-400">Employee</TableHead>
                <TableHead className="dark:text-gray-400">Type</TableHead>
                <TableHead className="dark:text-gray-400">Amount</TableHead>
                <TableHead className="dark:text-gray-400">Reason</TableHead>
                <TableHead className="dark:text-gray-400">Adjusted By</TableHead>
                <TableHead className="dark:text-gray-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.map((adj) => (
                <TableRow key={adj.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {adj.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{adj.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{adj.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                      {adj.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${adj.amount > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {adj.amount > 0 ? '+' : ''}₱{Math.abs(adj.amount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-gray-400 text-sm max-w-[150px] truncate">{adj.reason}</TableCell>
                  <TableCell className="dark:text-gray-300">{adj.adjustedBy}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(adj.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}