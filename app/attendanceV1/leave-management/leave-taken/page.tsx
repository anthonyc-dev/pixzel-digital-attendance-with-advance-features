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
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const mockLeaveTaken = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", leaveType: "Vacation", startDate: "2026-04-07", endDate: "2026-04-11", days: 5, status: "Approved", approvedBy: "HR Manager" },
  { id: 2, employeeId: "EMP005", name: "David Kim", leaveType: "Sick", startDate: "2026-04-09", endDate: "2026-04-11", days: 3, status: "Approved", approvedBy: "HR Manager" },
  { id: 3, employeeId: "EMP002", name: "Maria Clara Rivera", leaveType: "Personal", startDate: "2026-04-05", endDate: "2026-04-05", days: 1, status: "Approved", approvedBy: "Department Head" },
  { id: 4, employeeId: "EMP003", name: "Robert Chen", leaveType: "Vacation", startDate: "2026-04-14", endDate: "2026-04-18", days: 5, status: "Pending", approvedBy: "-" },
  { id: 5, employeeId: "EMP004", name: "Sarah Johnson", leaveType: "Sick", startDate: "2026-04-10", endDate: "2026-04-10", days: 1, status: "Approved", approvedBy: "HR Manager" },
  { id: 6, employeeId: "EMP007", name: "James Rodriguez", leaveType: "Personal", startDate: "2026-04-03", endDate: "2026-04-03", days: 1, status: "Rejected", approvedBy: "-" },
];

export default function LeaveTakenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleStatusFilterChange = (value: string | null) => {
    if (value) setStatusFilter(value);
  };

  const handleTypeFilterChange = (value: string | null) => {
    if (value) setTypeFilter(value);
  };

  const filteredLeaves = mockLeaveTaken.filter(leave => {
    const matchesSearch = leave.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || leave.leaveType.toLowerCase().includes(typeFilter);
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Pending': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      case 'Rejected': return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approvedCount = mockLeaveTaken.filter(l => l.status === 'Approved').length;
  const pendingCount = mockLeaveTaken.filter(l => l.status === 'Pending').length;
  const totalDays = mockLeaveTaken.filter(l => l.status === 'Approved').reduce((acc, l) => acc + l.days, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Leave Taken</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">View and track all leave records</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Approved Leaves</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Pending Approval</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Days Taken</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalDays} days</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
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
              <CardTitle className="dark:text-white">Leave Records</CardTitle>
              <CardDescription className="dark:text-gray-400">All leave applications and their status</CardDescription>
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
                <SelectTrigger className="w-full sm:w-36 dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-white/5 dark:border-white/10">
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
                <TableHead className="dark:text-gray-400">Leave Type</TableHead>
                <TableHead className="dark:text-gray-400">Start Date</TableHead>
                <TableHead className="dark:text-gray-400">End Date</TableHead>
                <TableHead className="dark:text-gray-400">Days</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="dark:text-gray-400">Approved By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {leave.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{leave.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{leave.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{leave.leaveType}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="dark:text-gray-300">{leave.days}</TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell className="dark:text-gray-400">{leave.approvedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}