'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download, 
  FileText,
  DollarSign,
  Calendar,
  Users,
  Search
} from 'lucide-react';

const mockPayrollRegister = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", department: "Engineering", grossPay: 45000, deductions: 8200, netPay: 36800 },
  { id: 2, employeeId: "EMP002", name: "Maria Clara Rivera", department: "Design", grossPay: 38000, deductions: 5700, netPay: 32300 },
  { id: 3, employeeId: "EMP003", name: "Robert Chen", department: "Marketing", grossPay: 52000, deductions: 9500, netPay: 42500 },
  { id: 4, employeeId: "EMP004", name: "Sarah Johnson", department: "Human Resources", grossPay: 35000, deductions: 4500, netPay: 30500 },
  { id: 5, employeeId: "EMP006", name: "Emily White", department: "Engineering", grossPay: 36000, deductions: 4800, netPay: 31200 },
];

export default function PayrollRegisterPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRegister = mockPayrollRegister.filter(emp => {
    return emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalGross = mockPayrollRegister.reduce((acc, e) => acc + e.grossPay, 0);
  const totalDeductions = mockPayrollRegister.reduce((acc, e) => acc + e.deductions, 0);
  const totalNet = mockPayrollRegister.reduce((acc, e) => acc + e.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Payroll Register</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Detailed payroll report for the current period</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Employees</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockPayrollRegister.length}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Gross Pay</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalGross.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Deductions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalDeductions.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Net Pay</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalNet.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Payroll Details</CardTitle>
              <CardDescription className="dark:text-gray-400">April 1-15, 2026</CardDescription>
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
                <TableHead className="dark:text-gray-400">Department</TableHead>
                <TableHead className="text-right dark:text-gray-400">Gross Pay</TableHead>
                <TableHead className="text-right dark:text-gray-400">Deductions</TableHead>
                <TableHead className="text-right dark:text-gray-400">Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegister.map((emp) => (
                <TableRow key={emp.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div>
                      <p className="font-medium dark:text-white">{emp.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">{emp.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{emp.department}</TableCell>
                  <TableCell className="text-right dark:text-gray-300">₱{emp.grossPay.toLocaleString()}</TableCell>
                  <TableCell className="text-right dark:text-gray-300">₱{emp.deductions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium dark:text-white">₱{emp.netPay.toLocaleString()}</span>
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