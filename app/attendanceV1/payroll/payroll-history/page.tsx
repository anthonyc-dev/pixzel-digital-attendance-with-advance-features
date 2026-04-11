'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Download,
  Eye,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2
} from 'lucide-react';
import { payrollData } from '@/lib/mock-data';

export default function PayrollHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayroll = payrollData.filter(payroll => {
    return payroll.period.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Finalized': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Processing': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPayroll = payrollData.reduce((acc, p) => acc + p.totalPayroll, 0);
  const totalNetPay = payrollData.reduce((acc, p) => acc + p.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Payroll History</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">View and manage past payroll records</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Payroll</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalPayroll.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <DollarSign className="w-6 h-6 text-white" />
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
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Periods</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{payrollData.length}</p>
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
              <CardTitle className="dark:text-white">Payroll Records</CardTitle>
              <CardDescription className="dark:text-gray-400">All payroll periods</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search period..." 
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
                <TableHead className="dark:text-gray-400">Period</TableHead>
                <TableHead className="dark:text-gray-400">Employees</TableHead>
                <TableHead className="dark:text-gray-400">Total Payroll</TableHead>
                <TableHead className="dark:text-gray-400">Net Pay</TableHead>
                <TableHead className="dark:text-gray-400">Processed Date</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((payroll) => (
                <TableRow key={payroll.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell className="font-medium dark:text-white">{payroll.period}</TableCell>
                  <TableCell className="dark:text-gray-300">{payroll.totalEmployees}</TableCell>
                  <TableCell className="dark:text-gray-300">₱{payroll.totalPayroll.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-medium dark:text-white">₱{payroll.netPay.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(payroll.processedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                      <Eye className="w-4 h-4" />
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