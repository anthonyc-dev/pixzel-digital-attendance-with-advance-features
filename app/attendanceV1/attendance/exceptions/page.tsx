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
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

const mockExceptions = [
  { id: 1, employeeId: "EMP007", name: "James Rodriguez", date: "2026-04-11", type: "Late Arrival", time: "09:10", duration: "10 min", status: "Pending", reason: "Traffic delay" },
  { id: 2, employeeId: "EMP001", name: "John Michael Santos", date: "2026-04-10", type: "Missed Punch", time: "17:32", duration: "-", status: "Resolved", reason: "System glitch" },
  { id: 3, employeeId: "EMP003", name: "Robert Chen", date: "2026-04-09", type: "Early Departure", time: "16:45", duration: "45 min", status: "Pending", reason: "Doctor's appointment" },
  { id: 4, employeeId: "EMP002", name: "Maria Clara Rivera", date: "2026-04-08", type: "Late Arrival", time: "09:15", duration: "15 min", status: "Approved", reason: "Car trouble" },
  { id: 5, employeeId: "EMP006", name: "Emily White", date: "2026-04-07", type: "Overtime Violation", time: "19:00", duration: "1 hr", status: "Pending", reason: "Project deadline" },
];

export default function AttendanceExceptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleTypeFilterChange = (value: string | null) => {
    if (value) setTypeFilter(value);
  };

  const handleStatusFilterChange = (value: string | null) => {
    if (value) setStatusFilter(value);
  };

  const filteredExceptions = mockExceptions.filter(exc => {
    const matchesSearch = exc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exc.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || exc.type.toLowerCase().includes(typeFilter);
    const matchesStatus = statusFilter === 'all' || exc.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      case 'Approved': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Resolved': return <Badge variant="outline" className="border-green-500 text-green-500">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Late')) return <AlertCircle className="w-4 h-4 text-amber-500" />;
    if (type.includes('Missed')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (type.includes('Early')) return <Clock className="w-4 h-4 text-orange-500" />;
    if (type.includes('Overtime')) return <AlertCircle className="w-4 h-4 text-purple-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  const pendingCount = mockExceptions.filter(e => e.status === 'Pending').length;
  const approvedCount = mockExceptions.filter(e => e.status === 'Approved').length;
  const resolvedCount = mockExceptions.filter(e => e.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Attendance Exceptions</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Review and resolve attendance exceptions</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{approvedCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
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
              <div className="p-3 rounded-xl bg-blue-500">
                <CheckCircle className="w-6 h-6 text-white" />
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
              <CardDescription className="dark:text-gray-400">All attendance exceptions requiring attention</CardDescription>
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
                  <SelectValue placeholder="Exception Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="late">Late Arrival</SelectItem>
                  <SelectItem value="missed">Missed Punch</SelectItem>
                  <SelectItem value="early">Early Departure</SelectItem>
                  <SelectItem value="overtime">Overtime Violation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
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
                <TableHead className="dark:text-gray-400">Exception Type</TableHead>
                <TableHead className="dark:text-gray-400">Time</TableHead>
                <TableHead className="dark:text-gray-400">Duration</TableHead>
                <TableHead className="dark:text-gray-400">Reason</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
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
                  <TableCell className="dark:text-gray-300">{new Date(exc.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(exc.type)}
                      <span className="dark:text-gray-300">{exc.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{exc.time}</TableCell>
                  <TableCell className="dark:text-gray-300">{exc.duration}</TableCell>
                  <TableCell className="dark:text-gray-400 text-sm">{exc.reason}</TableCell>
                  <TableCell>{getStatusBadge(exc.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
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