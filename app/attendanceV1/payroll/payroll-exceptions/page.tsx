'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

const mockExceptions = [
  { id: 1, employeeId: "EMP007", name: "James Rodriguez", type: "Missing Time Out", amount: 0, status: "Pending", description: "No time out recorded on 2026-04-10", date: "2026-04-11" },
  { id: 2, employeeId: "EMP001", name: "John Michael Santos", type: "Overtime Discrepancy", amount: 250, status: "Resolved", description: "OT calculation differs from actual", date: "2026-04-10" },
  { id: 3, employeeId: "EMP003", name: "Robert Chen", type: "Leave Deduction Error", amount: -500, status: "Pending", description: "Leave deduction should be 3 days not 2", date: "2026-04-09" },
];

export default function PayrollExceptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusFilterChange = (value: string | null) => {
    if (value) setStatusFilter(value);
  };

  const filteredExceptions = mockExceptions.filter(exc => {
    const matchesSearch = exc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exc.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exc.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      case 'Resolved': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Rejected': return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Missing')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type.includes('Overtime')) return <Clock className="w-4 h-4 text-amber-500" />;
    if (type.includes('Leave')) return <AlertCircle className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  const pendingCount = mockExceptions.filter(e => e.status === 'Pending').length;
  const resolvedCount = mockExceptions.filter(e => e.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Payroll Exceptions</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Review and resolve payroll exceptions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Exceptions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockExceptions.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{resolvedCount}</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Exception List</CardTitle>
              <CardDescription className="dark:text-gray-400">All payroll exceptions requiring attention</CardDescription>
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
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-36 dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                <TableHead className="dark:text-gray-400">Exception Type</TableHead>
                <TableHead className="dark:text-gray-400">Amount Impact</TableHead>
                <TableHead className="dark:text-gray-400">Description</TableHead>
                <TableHead className="dark:text-gray-400">Date</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExceptions.map((exc) => (
                <TableRow key={exc.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {exc.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{exc.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{exc.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(exc.type)}
                      <span className="dark:text-gray-300">{exc.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {exc.amount !== 0 ? (
                      <span className={`font-medium ${exc.amount > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {exc.amount > 0 ? '+' : ''}₱{Math.abs(exc.amount).toLocaleString()}
                      </span>
                    ) : (
                      <span className="dark:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="dark:text-gray-400 text-sm max-w-[200px] truncate">{exc.description}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(exc.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(exc.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}