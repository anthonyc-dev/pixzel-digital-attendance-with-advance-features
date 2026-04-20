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
  Plus, 
  MoreHorizontal, 
  Download,
  Users,
  Calendar,
  Filter,
  Building2
} from 'lucide-react';
import { employees as initialEmployees, departments, positions } from '@/lib/mock-data';

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
  });

  const handleDepartmentFilterChange = (value: string | null) => {
    if (value) setDepartmentFilter(value);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'on-leave':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">On Leave</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.position) return;
    
    const empId = `EMP00${employees.length + 1}`;
    const initials = newEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    const employee = {
      id: empId,
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department,
      position: newEmployee.position,
      status: 'active',
      hireDate: newEmployee.hireDate,
      avatar: initials,
      salary: 0,
      attendanceRate: 100,
    };
    
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', department: '', position: '', hireDate: new Date().toISOString().split('T')[0] });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Employee Management</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Manage and track all employee records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="dark:bg-black dark:border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add New Employee</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Enter employee details to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Full Name</Label>
              <Input 
                placeholder="John Doe" 
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Email</Label>
              <Input 
                type="email"
                placeholder="john.doe@pixzel.com" 
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Department</Label>
              <Select value={newEmployee.department} onValueChange={(value) => { if (value) setNewEmployee({ ...newEmployee, department: value }); }}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Position</Label>
              <Select value={newEmployee.position} onValueChange={(value) => { if (value) setNewEmployee({ ...newEmployee, position: value }); }}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Hire Date</Label>
              <Input 
                type="date" 
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={newEmployee.hireDate}
                onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="dark:border-white/20 dark:text-gray-300">
              Cancel
            </Button>
            <Button className="bg-secondary hover:bg-secondary/90" onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{employees.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{employees.filter(e => e.status === 'active').length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">On Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{employees.filter(e => e.status === 'on-leave').length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Departments</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{departments.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Employee List</CardTitle>
              <CardDescription className="dark:text-gray-400">View and manage all employees</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search employees..." 
                  className="pl-9 w-full sm:w-64 dark:bg-white/5 dark:border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={departmentFilter} onValueChange={handleDepartmentFilterChange}>
                <SelectTrigger className="w-full sm:w-40 dark:bg-white/5 dark:border-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
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
                <TableHead className="dark:text-gray-400">Department</TableHead>
                <TableHead className="dark:text-gray-400">Position</TableHead>
                <TableHead className="dark:text-gray-400">Hire Date</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="dark:text-gray-400">Attendance</TableHead>
                <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {employee.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{employee.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{employee.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{employee.department}</TableCell>
                  <TableCell className="dark:text-gray-300">{employee.position}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(employee.hireDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${employee.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-xs dark:text-gray-400">{employee.attendanceRate}%</span>
                    </div>
                  </TableCell>
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