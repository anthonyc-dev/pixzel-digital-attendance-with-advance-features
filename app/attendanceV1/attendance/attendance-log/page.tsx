'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer
} from 'lucide-react';
import { attendanceLogs, employees } from '@/lib/mock-data';

export default function AttendanceLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2026-04-11');

  const handleStatusFilterChange = (value: string | null) => {
    if (value) setStatusFilter(value);
  };

  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase().replace(' ', '-') === statusFilter;
    const matchesDate = log.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Late': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'On Leave': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Late': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      case 'On Leave': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 dark:text-blue-400">{status}</Badge>;
      case 'Absent': return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const presentCount = attendanceLogs.filter(l => l.status === 'Present').length;
  const lateCount = attendanceLogs.filter(l => l.status === 'Late').length;
  const onLeaveCount = attendanceLogs.filter(l => l.status === 'On Leave').length;
  const totalHours = attendanceLogs.reduce((acc, l) => acc + l.hoursWorked, 0);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Attendance Log</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Track and monitor daily attendance records</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Present</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{presentCount}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Late</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{lateCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">On Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{onLeaveCount}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalHours.toFixed(1)}h</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Timer className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Daily Attendance</CardTitle>
              <CardDescription className="dark:text-gray-400">Employee attendance for selected date</CardDescription>
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
              <Input 
                type="date" 
                className="w-full sm:w-40 dark:bg-white/5 dark:border-white/10"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-white/5 dark:border-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
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
                <TableHead className="dark:text-gray-400">Time In</TableHead>
                <TableHead className="dark:text-gray-400">Time Out</TableHead>
                <TableHead className="dark:text-gray-400">Hours Worked</TableHead>
                <TableHead className="dark:text-gray-400">Overtime</TableHead>
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
                  <TableCell className="dark:text-gray-300">{log.timeIn}</TableCell>
                  <TableCell className="dark:text-gray-300">{log.timeOut}</TableCell>
                  <TableCell className="dark:text-gray-300">{log.hoursWorked.toFixed(2)}h</TableCell>
                  <TableCell>
                    {log.overtime > 0 ? (
                      <span className="text-green-500 dark:text-green-400">+{log.overtime.toFixed(2)}h</span>
                    ) : (
                      <span className="text-muted-foreground dark:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}