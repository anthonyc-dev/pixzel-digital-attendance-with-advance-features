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
  Download,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Timer
} from 'lucide-react';
import { overtimeLogs, employees } from '@/lib/mock-data';

export default function OvertimeLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusFilterChange = (value: string | null) => {
    if (value) setStatusFilter(value);
  };

  const filteredLogs = overtimeLogs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Pending': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      case 'Rejected': return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approvedCount = overtimeLogs.filter(l => l.status === 'Approved').length;
  const pendingCount = overtimeLogs.filter(l => l.status === 'Pending').length;
  const totalHours = overtimeLogs.reduce((acc, l) => acc + l.hours, 0);
  const totalAmount = overtimeLogs.reduce((acc, l) => acc + l.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Overtime Log</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Track and manage overtime records</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Overtime</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalHours.toFixed(1)} hrs</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Timer className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalAmount.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{approvedCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CheckCircle2 className="w-6 h-6 text-white" />
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
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Overtime Records</CardTitle>
              <CardDescription className="dark:text-gray-400">All overtime entries with payment details</CardDescription>
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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
                <TableHead className="dark:text-gray-400">Date</TableHead>
                <TableHead className="dark:text-gray-400">Hours</TableHead>
                <TableHead className="dark:text-gray-400">Rate</TableHead>
                <TableHead className="dark:text-gray-400">Amount</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {log.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{log.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{log.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell className="dark:text-gray-300">{log.hours.toFixed(1)} hrs</TableCell>
                  <TableCell className="dark:text-gray-300">{log.rate}x</TableCell>
                  <TableCell>
                    <span className="font-medium dark:text-white">₱{log.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}