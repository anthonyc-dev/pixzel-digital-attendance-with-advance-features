'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Download,
  Plus,
  Banknote,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';
import { loans } from '@/lib/mock-data';

export default function ActiveLoansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleTypeFilterChange = (value: string | null) => {
    if (value) setTypeFilter(value);
  };

  const activeLoans = loans.filter(l => l.status === 'Active');
  
  const filteredLoans = activeLoans.filter(loan => {
    const matchesSearch = loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loan.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || loan.type.toLowerCase().includes(typeFilter);
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Completed': return <Badge variant="outline" className="border-green-500 text-green-500">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalLoanAmount = activeLoans.reduce((acc, l) => acc + l.amount, 0);
  const totalRemaining = activeLoans.reduce((acc, l) => acc + l.remaining, 0);
  const totalMonthly = activeLoans.reduce((acc, l) => acc + l.monthly, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Active Loans & CA</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Manage active loans and cash advances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Loan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Loan Amount</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalLoanAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Banknote className="w-6 h-6 text-white" />
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
                <DollarSign className="w-6 h-6 text-white" />
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
              <div className="p-3 rounded-xl bg-green-500">
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
              <CardTitle className="dark:text-white">Active Loans</CardTitle>
              <CardDescription className="dark:text-gray-400">Currently active loans and cash advances</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search employee..." 
                  className="pl-9 w-full sm:w-48 dark:bg-white/5 dark:border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-full sm:w-40 dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Loan Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="salary">Salary Advance</SelectItem>
                  <SelectItem value="emergency">Emergency Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-white/5 hover:bg-transparent">
                <TableHead className="dark:text-gray-400">Employee</TableHead>
                <TableHead className="dark:text-gray-400">Loan Type</TableHead>
                <TableHead className="dark:text-gray-400">Amount</TableHead>
                <TableHead className="dark:text-gray-400">Remaining</TableHead>
                <TableHead className="dark:text-gray-400">Monthly</TableHead>
                <TableHead className="dark:text-gray-400">End Date</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => {
                const progressPercent = ((loan.amount - loan.remaining) / loan.amount) * 100;
                return (
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
                      <div className="space-y-1">
                        <span className="font-medium dark:text-white">₱{loan.remaining.toLocaleString()}</span>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">₱{loan.monthly.toLocaleString()}</TableCell>
                    <TableCell className="dark:text-gray-300">{new Date(loan.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
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