'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Wallet,
  DollarSign,
  Calendar,
  TrendingDown,
  Search
} from 'lucide-react';
import { loans } from '@/lib/mock-data';

export default function LoanBalanceReportPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const activeLoans = loans.filter(l => l.status === 'Active');
  
  const filteredLoans = activeLoans.filter(loan => {
    return loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           loan.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalLoanAmount = activeLoans.reduce((acc, l) => acc + l.amount, 0);
  const totalRemaining = activeLoans.reduce((acc, l) => acc + l.remaining, 0);
  const totalMonthly = activeLoans.reduce((acc, l) => acc + l.monthly, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Loan Balance Report</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Overview of all active loan balances</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{activeLoans.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Principal</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalLoanAmount.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Remaining</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalRemaining.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Monthly Deduction</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalMonthly.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Loan Balances</CardTitle>
              <CardDescription className="dark:text-gray-400">Active loans with remaining balance</CardDescription>
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
                <TableHead className="text-right dark:text-gray-400">Original</TableHead>
                <TableHead className="text-right dark:text-gray-400">Remaining</TableHead>
                <TableHead className="text-right dark:text-gray-400">Paid</TableHead>
                <TableHead className="text-right dark:text-gray-400">Monthly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => {
                const progressPercent = ((loan.amount - loan.remaining) / loan.amount) * 100;
                return (
                  <TableRow key={loan.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                    <TableCell>
                      <div>
                        <p className="font-medium dark:text-white">{loan.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{loan.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">{loan.type}</TableCell>
                    <TableCell className="text-right dark:text-gray-300">₱{loan.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium dark:text-white">₱{loan.remaining.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <Progress value={progressPercent} className="h-2" />
                        <span className="text-xs dark:text-gray-400">{progressPercent.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right dark:text-gray-300">₱{loan.monthly.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}