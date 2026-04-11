'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Filter,
  Calendar,
  Plus,
  RefreshCw,
  Palmtree,
  Thermometer,
  User,
  Clock
} from 'lucide-react';
import { employees, leaveBalances as initialLeaveBalances, leaveTypes } from '@/lib/mock-data';

export default function LeaveBalancePage() {
  const [leaveBalances, setLeaveBalances] = useState(initialLeaveBalances);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    leaveType: '',
    total: 0,
  });

  const handleLeaveTypeFilterChange = (value: string | null) => {
    if (value) setLeaveTypeFilter(value);
  };

  const filteredBalances = leaveBalances.filter(balance => {
    const matchesSearch = balance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          balance.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = leaveTypeFilter === 'all' || balance.leaveType.toLowerCase().includes(leaveTypeFilter);
    return matchesSearch && matchesType;
  });

  const getLeaveIcon = (type: string) => {
    if (type.toLowerCase().includes('vacation')) return <Palmtree className="w-4 h-4" />;
    if (type.toLowerCase().includes('sick')) return <Thermometer className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const getLeaveColor = (type: string) => {
    if (type.toLowerCase().includes('vacation')) return 'bg-blue-500';
    if (type.toLowerCase().includes('sick')) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const vacationTotal = leaveBalances.filter(b => b.leaveType === 'Vacation').reduce((acc, b) => acc + b.total, 0);
  const vacationUsed = leaveBalances.filter(b => b.leaveType === 'Vacation').reduce((acc, b) => acc + b.used, 0);
  const sickTotal = leaveBalances.filter(b => b.leaveType === 'Sick').reduce((acc, b) => acc + b.total, 0);
  const sickUsed = leaveBalances.filter(b => b.leaveType === 'Sick').reduce((acc, b) => acc + b.used, 0);
  const personalTotal = leaveBalances.filter(b => b.leaveType === 'Personal').reduce((acc, b) => acc + b.total, 0);
  const personalUsed = leaveBalances.filter(b => b.leaveType === 'Personal').reduce((acc, b) => acc + b.used, 0);

  const handleAddLeave = () => {
    if (!newLeave.employeeId || !newLeave.leaveType || !newLeave.total) return;
    
    const employee = employees.find(e => e.id === newLeave.employeeId);
    if (!employee) return;
    
    const leave = {
      id: leaveBalances.length + 1,
      employeeId: newLeave.employeeId,
      name: employee.name,
      leaveType: newLeave.leaveType,
      total: newLeave.total,
      used: 0,
      remaining: newLeave.total,
    };
    
    setLeaveBalances([...leaveBalances, leave]);
    setNewLeave({ employeeId: '', leaveType: '', total: 0 });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Leave Balance</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Track and manage employee leave balances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Leave
          </Button>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="dark:bg-black dark:border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Leave Balance</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Add leave balance for an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Employee</Label>
              <Select value={newLeave.employeeId} onValueChange={(value) => { if (value) setNewLeave({ ...newLeave, employeeId: value }); }}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Leave Type</Label>
              <Select value={newLeave.leaveType} onValueChange={(value) => { if (value) setNewLeave({ ...newLeave, leaveType: value }); }}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  {leaveTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Total Days</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={newLeave.total || ''}
                onChange={(e) => setNewLeave({ ...newLeave, total: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="dark:border-white/20 dark:text-gray-300">
              Cancel
            </Button>
            <Button className="bg-secondary hover:bg-secondary/90" onClick={handleAddLeave}>
              Add Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Vacation Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{vacationTotal - vacationUsed} / {vacationTotal}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Palmtree className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${vacationTotal > 0 ? (vacationUsed / vacationTotal) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{vacationUsed} used</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Sick Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{sickTotal - sickUsed} / {sickTotal}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${sickTotal > 0 ? (sickUsed / sickTotal) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{sickUsed} used</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Personal Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{personalTotal - personalUsed} / {personalTotal}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${personalTotal > 0 ? (personalUsed / personalTotal) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{personalUsed} used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Employee Leave Balances</CardTitle>
              <CardDescription className="dark:text-gray-400">Detailed breakdown of all leave types per employee</CardDescription>
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
              <Select value={leaveTypeFilter} onValueChange={handleLeaveTypeFilterChange}>
                <SelectTrigger className="w-full sm:w-40 dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
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
                <TableHead className="dark:text-gray-400">Total</TableHead>
                <TableHead className="dark:text-gray-400">Used</TableHead>
                <TableHead className="dark:text-gray-400">Remaining</TableHead>
                <TableHead className="dark:text-gray-400">Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBalances.map((balance) => (
                <TableRow key={balance.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {balance.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{balance.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{balance.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${getLeaveColor(balance.leaveType)}`}>
                        {getLeaveIcon(balance.leaveType)}
                      </div>
                      <span className="dark:text-gray-300">{balance.leaveType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{balance.total} days</TableCell>
                  <TableCell className="dark:text-gray-300">{balance.used} days</TableCell>
                  <TableCell>
                    <span className="font-medium dark:text-white">{balance.remaining} days</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${balance.used / balance.total > 0.7 ? 'bg-red-500' : balance.used / balance.total > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${(balance.used / balance.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs dark:text-gray-400">{((balance.used / balance.total) * 100).toFixed(0)}%</span>
                    </div>
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