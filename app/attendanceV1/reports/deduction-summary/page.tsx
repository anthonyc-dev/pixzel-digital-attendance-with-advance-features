'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download, 
  FileText,
  DollarSign,
  CreditCard,
  PieChart
} from 'lucide-react';

const mockDeductions = [
  { type: "SSS", employeeShare: 1200, employerShare: 1200, total: 2400 },
  { type: "PhilHealth", employeeShare: 800, employerShare: 800, total: 1600 },
  { type: "Pag-IBIG", employeeShare: 500, employerShare: 500, total: 1000 },
  { type: "Loan Deductions", employeeShare: 8000, employerShare: 0, total: 8000 },
];

export default function DeductionSummaryPage() {
  const totalEmployee = mockDeductions.reduce((acc, d) => acc + d.employeeShare, 0);
  const totalEmployer = mockDeductions.reduce((acc, d) => acc + d.employerShare, 0);
  const grandTotal = totalEmployee + totalEmployer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Deduction Summary</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Summary of all government and loan deductions</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Employee Share</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalEmployee.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Employer Share</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalEmployer.toLocaleString()}</p>
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
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{grandTotal.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="dark:text-white">Deduction Breakdown</CardTitle>
            <CardDescription className="dark:text-gray-400">April 2026</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-white/5 hover:bg-transparent">
                <TableHead className="dark:text-gray-400">Deduction Type</TableHead>
                <TableHead className="text-right dark:text-gray-400">Employee Share</TableHead>
                <TableHead className="text-right dark:text-gray-400">Employer Share</TableHead>
                <TableHead className="text-right dark:text-gray-400">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeductions.map((deduction, index) => (
                <TableRow key={index} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell className="font-medium dark:text-white">{deduction.type}</TableCell>
                  <TableCell className="text-right dark:text-gray-300">₱{deduction.employeeShare.toLocaleString()}</TableCell>
                  <TableCell className="text-right dark:text-gray-300">₱{deduction.employerShare.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium dark:text-white">₱{deduction.total.toLocaleString()}</span>
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