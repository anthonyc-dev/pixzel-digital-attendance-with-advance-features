'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Download,
  FileText,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';
import { employees } from '@/lib/mock-data';

const mockPayslips = [
  { id: 1, period: "April 1-15, 2026", employeeId: "EMP001", name: "John Michael Santos", netPay: 36800, status: "Released" },
  { id: 2, period: "April 1-15, 2026", employeeId: "EMP002", name: "Maria Clara Rivera", netPay: 32300, status: "Released" },
  { id: 3, period: "April 1-15, 2026", employeeId: "EMP003", name: "Robert Chen", netPay: 42500, status: "Released" },
  { id: 4, period: "April 1-15, 2026", employeeId: "EMP004", name: "Sarah Johnson", netPay: 30500, status: "Released" },
  { id: 5, period: "April 1-15, 2026", employeeId: "EMP006", name: "Emily White", netPay: 31200, status: "Released" },
];

export default function EmployeePayslipPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayslips = mockPayslips.filter(payslip => {
    return payslip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalNetPay = mockPayslips.reduce((acc, p) => acc + p.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Employee Payslips</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">View and download employee payslips</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Payslips</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockPayslips.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Net Pay</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalNetPay.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Current Period</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">April 1-15</p>
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
              <CardTitle className="dark:text-white">Payslip List</CardTitle>
              <CardDescription className="dark:text-gray-400">All payslips for current period</CardDescription>
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
                <TableHead className="dark:text-gray-400">Period</TableHead>
                <TableHead className="text-right dark:text-gray-400">Net Pay</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow key={payslip.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {payslip.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{payslip.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{payslip.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{payslip.period}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium dark:text-white">₱{payslip.netPay.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600">{payslip.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                      <Download className="w-4 h-4" />
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