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
  Download,
  History,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

const mockLoanHistory = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", type: "Salary Advance", amount: 50000, paid: 15000, status: "Active", startDate: "2025-10-01", endDate: "2026-09-30" },
  { id: 2, employeeId: "EMP003", name: "Robert Chen", type: "Emergency Loan", amount: 30000, paid: 12000, status: "Active", startDate: "2025-08-15", endDate: "2026-08-14" },
  { id: 3, employeeId: "EMP004", name: "Sarah Johnson", type: "Salary Advance", amount: 20000, paid: 20000, status: "Completed", startDate: "2024-12-01", endDate: "2025-11-30" },
  { id: 4, employeeId: "EMP006", name: "Emily White", type: "Emergency Loan", amount: 15000, paid: 15000, status: "Completed", startDate: "2024-06-01", endDate: "2025-05-31" },
];

export default function LoanHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = mockLoanHistory.filter(loan => {
    return loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           loan.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Completed': return <Badge variant="outline" className="border-green-500 text-green-500">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeCount = mockLoanHistory.filter(l => l.status === 'Active').length;
  const completedCount = mockLoanHistory.filter(l => l.status === 'Completed').length;
  const totalPaid = mockLoanHistory.reduce((acc, l) => acc + l.paid, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Loan History</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Complete history of all loans and payments</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{activeCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{completedCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalPaid.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <History className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">All Loans</CardTitle>
              <CardDescription className="dark:text-gray-400">Complete loan history</CardDescription>
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
                <TableHead className="dark:text-gray-400">Loan Type</TableHead>
                <TableHead className="dark:text-gray-400">Total Amount</TableHead>
                <TableHead className="dark:text-gray-400">Amount Paid</TableHead>
                <TableHead className="dark:text-gray-400">Start Date</TableHead>
                <TableHead className="dark:text-gray-400">End Date</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((loan) => (
                <TableRow key={loan.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {loan.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{loan.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{loan.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{loan.type}</TableCell>
                  <TableCell className="dark:text-gray-300">₱{loan.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-medium dark:text-white">₱{loan.paid.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(loan.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}