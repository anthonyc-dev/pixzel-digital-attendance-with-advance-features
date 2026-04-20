'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  FileText,
  PieChart,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';

const mockDeductionReport = [
  { type: "SSS", amount: 1200, employees: 8, percentage: 25 },
  { type: "PhilHealth", amount: 800, employees: 8, percentage: 17 },
  { type: "Pag-IBIG", amount: 500, employees: 8, percentage: 10 },
  { type: "Loan Deduction", amount: 8000, employees: 2, percentage: 48 },
];

export default function DeductionReportPage() {
  const [period, setPeriod] = useState('this-month');

  const handlePeriodChange = (value: string | null) => {
    if (value) setPeriod(value);
  };

  const totalDeductions = mockDeductionReport.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Deduction Report</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Summary of all deductions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40 dark:bg-white/5 dark:border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-black dark:border-white/10">
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Deductions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalDeductions.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">SSS</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱1,200</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">PhilHealth</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱800</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Pag-IBIG</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱500</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="pb-4">
            <div>
              <CardTitle className="dark:text-white">Deduction Breakdown</CardTitle>
              <CardDescription className="dark:text-gray-400">Percentage by type</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDeductionReport.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="dark:text-gray-300">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white w-20 text-right">₱{item.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="pb-4">
            <div>
              <CardTitle className="dark:text-white">Summary</CardTitle>
              <CardDescription className="dark:text-gray-400">Key metrics</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-white/5">
                <span className="dark:text-gray-400">Total Employees</span>
                <span className="font-medium dark:text-white">8</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-white/5">
                <span className="dark:text-gray-400">Total Deduction Types</span>
                <span className="font-medium dark:text-white">4</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-white/5">
                <span className="dark:text-gray-400">Avg Deduction/Employee</span>
                <span className="font-medium dark:text-white">₱1,325</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}