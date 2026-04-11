'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Calendar,
  TrendingUp,
  BarChart3,
  DollarSign,
  Clock
} from 'lucide-react';

const mockOvertimeReport = [
  { week: "Apr 7-11", hours: 8.5, amount: 850, employees: 4 },
  { week: "Mar 31 - Apr 4", hours: 12.0, amount: 1200, employees: 5 },
  { week: "Mar 24-28", hours: 6.5, amount: 650, employees: 3 },
  { week: "Mar 17-21", hours: 15.0, amount: 1500, employees: 6 },
  { week: "Mar 10-14", hours: 9.0, amount: 900, employees: 4 },
];

export default function OvertimeReportPage() {
  const [dateRange, setDateRange] = useState('this-month');

  const handleDateRangeChange = (value: string | null) => {
    if (value) setDateRange(value);
  };

  const totalHours = mockOvertimeReport.reduce((acc, r) => acc + r.hours, 0);
  const totalAmount = mockOvertimeReport.reduce((acc, r) => acc + r.amount, 0);
  const avgHours = totalHours / mockOvertimeReport.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Overtime Report</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Analyze overtime trends and costs</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40 dark:bg-white/5 dark:border-white/10">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-black dark:border-white/10">
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalHours.toFixed(1)} hrs</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalAmount.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Avg Hours/Week</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{avgHours.toFixed(1)} hrs</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Active Employees</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">6</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="pb-4">
            <div>
              <CardTitle className="dark:text-white">Weekly Overtime Hours</CardTitle>
              <CardDescription className="dark:text-gray-400">Overtime hours per week</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOvertimeReport.map((report, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">{report.week}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full" 
                        style={{ width: `${(report.hours / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium dark:text-white w-16 text-right">{report.hours.toFixed(1)} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="pb-4">
            <div>
              <CardTitle className="dark:text-white">Overtime Cost Breakdown</CardTitle>
              <CardDescription className="dark:text-gray-400">Cost per week</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOvertimeReport.map((report, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">{report.week}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(report.amount / 2000) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium dark:text-white w-20 text-right">₱{report.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="dark:text-white">Detailed Report</CardTitle>
            <CardDescription className="dark:text-gray-400">Complete overtime breakdown by week</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400">Period</th>
                  <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Hours</th>
                  <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Employees</th>
                  <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Avg Hours/Emp</th>
                  <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400">Cost</th>
                </tr>
              </thead>
              <tbody>
                {mockOvertimeReport.map((report, index) => (
                  <tr key={index} className="border-b dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-medium dark:text-white">{report.week}</td>
                    <td className="py-3 px-4 text-center dark:text-gray-300">{report.hours.toFixed(1)} hrs</td>
                    <td className="py-3 px-4 text-center dark:text-gray-300">{report.employees}</td>
                    <td className="py-3 px-4 text-center dark:text-gray-300">{(report.hours / report.employees).toFixed(1)} hrs</td>
                    <td className="py-3 px-4 text-right font-medium dark:text-white">₱{report.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 dark:bg-white/5">
                  <td className="py-3 px-4 font-bold dark:text-white">Total</td>
                  <td className="py-3 px-4 text-center font-bold dark:text-white">{totalHours.toFixed(1)} hrs</td>
                  <td className="py-3 px-4 text-center font-bold dark:text-white">-</td>
                  <td className="py-3 px-4 text-center font-bold dark:text-white">{avgHours.toFixed(1)} hrs</td>
                  <td className="py-3 px-4 text-right font-bold dark:text-white">₱{totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}