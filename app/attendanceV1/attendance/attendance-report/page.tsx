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
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

const mockReportData = [
  { department: 'Engineering', present: 45, late: 3, absent: 2, leave: 5 },
  { department: 'Design', present: 12, late: 1, absent: 0, leave: 2 },
  { department: 'Marketing', present: 18, late: 2, absent: 1, leave: 3 },
  { department: 'Human Resources', present: 8, late: 0, absent: 0, leave: 1 },
  { department: 'Finance', present: 10, late: 1, absent: 0, leave: 2 },
  { department: 'Operations', present: 15, late: 2, absent: 1, leave: 1 },
  { department: 'Sales', present: 22, late: 3, absent: 2, leave: 4 },
];

export default function AttendanceReportPage() {
  const [dateRange, setDateRange] = useState('this-month');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const handleDateRangeChange = (value: string | null) => {
    if (value) setDateRange(value);
  };

  const totalPresent = mockReportData.reduce((acc, d) => acc + d.present, 0);
  const totalLate = mockReportData.reduce((acc, d) => acc + d.late, 0);
  const totalAbsent = mockReportData.reduce((acc, d) => acc + d.absent, 0);
  const totalLeave = mockReportData.reduce((acc, d) => acc + d.leave, 0);
  const grandTotal = totalPresent + totalLate + totalAbsent + totalLeave;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Attendance Report</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Generate and analyze attendance reports</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Present</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalPresent}</p>
                <p className="text-xs text-green-500 mt-1">+5% from last period</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Late</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalLate}</p>
                <p className="text-xs text-amber-500 mt-1">-2% from last period</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Absent</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalAbsent}</p>
                <p className="text-xs text-red-500 mt-1">+1% from last period</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">On Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalLeave}</p>
                <p className="text-xs text-blue-500 mt-1">Same as last period</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 dark:bg-black dark:border-white/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="dark:text-white">Attendance by Department</CardTitle>
                <CardDescription className="dark:text-gray-400">Detailed breakdown per department</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-40 dark:bg-white/5 dark:border-white/10">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-black dark:border-white/10">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="this-quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400">Department</th>
                    <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Present</th>
                    <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Late</th>
                    <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Absent</th>
                    <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">On Leave</th>
                    <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReportData.map((dept) => {
                    const deptTotal = dept.present + dept.late + dept.absent + dept.leave;
                    const rate = ((dept.present / deptTotal) * 100).toFixed(1);
                    return (
                      <tr key={dept.department} className="border-b dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                        <td className="py-3 px-4 font-medium dark:text-white">{dept.department}</td>
                        <td className="py-3 px-4 text-center dark:text-gray-300">{dept.present}</td>
                        <td className="py-3 px-4 text-center dark:text-gray-300">{dept.late}</td>
                        <td className="py-3 px-4 text-center dark:text-gray-300">{dept.absent}</td>
                        <td className="py-3 px-4 text-center dark:text-gray-300">{dept.leave}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${parseFloat(rate) >= 90 ? 'text-green-500' : parseFloat(rate) >= 80 ? 'text-amber-500' : 'text-red-500'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 dark:bg-white/5">
                    <td className="py-3 px-4 font-bold dark:text-white">Total</td>
                    <td className="py-3 px-4 text-center font-medium dark:text-white">{totalPresent}</td>
                    <td className="py-3 px-4 text-center font-medium dark:text-white">{totalLate}</td>
                    <td className="py-3 px-4 text-center font-medium dark:text-white">{totalAbsent}</td>
                    <td className="py-3 px-4 text-center font-medium dark:text-white">{totalLeave}</td>
                    <td className="py-3 px-4 text-center font-medium dark:text-white">
                      {((totalPresent / grandTotal) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="pb-4">
            <div>
              <CardTitle className="dark:text-white">Attendance Rate</CardTitle>
              <CardDescription className="dark:text-gray-400">Overall performance</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold dark:text-white">94.2%</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">Average Attendance Rate</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">Present</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">Late</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">Absent</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '3%' }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">On Leave</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '4%' }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">4%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}