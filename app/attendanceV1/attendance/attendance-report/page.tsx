'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Download,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-react';
import { ENV } from '@/lib/api';

type AttendanceLog = {
  id: string;
  type: 'time_in' | 'time_out';
  status: string;
  employer_position?: string;
  employer_registration?: {
    employer_position?: string;
  };
};

type DepartmentReport = {
  department: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
};

function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRange(value: string): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (value === 'today') {
    return { start: formatDateParam(now), end: formatDateParam(now) };
  }

  if (value === 'this-week') {
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(now.getDate() + diffToMonday);
    return { start: formatDateParam(start), end: formatDateParam(end) };
  }

  if (value === 'this-quarter') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    return { start: formatDateParam(start), end: formatDateParam(end) };
  }

  // default: this-month
  start.setDate(1);
  return { start: formatDateParam(start), end: formatDateParam(end) };
}

export default function AttendanceReportPage() {
  const [dateRange, setDateRange] = useState('this-month');
  const [reportData, setReportData] = useState<DepartmentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (range: string) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getRange(range);
      const response = await fetch(
        `${ENV.API_URL}/attendance?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}`,
        { cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error('Failed to load attendance report data.');
      }

      const logs = (await response.json()) as AttendanceLog[];
      const grouped = new Map<string, DepartmentReport>();

      for (const log of logs) {
        // Report is based on time-in records in attendance_logs.
        if (log.type !== 'time_in') continue;

        const department =
          log.employer_registration?.employer_position ??
          log.employer_position ??
          'Unassigned';

        if (!grouped.has(department)) {
          grouped.set(department, {
            department,
            present: 0,
            late: 0,
            absent: 0,
            leave: 0,
          });
        }

        const row = grouped.get(department)!;
        if (log.status === 'late') {
          row.late += 1;
        } else {
          row.present += 1;
        }
      }

      setReportData(
        Array.from(grouped.values()).sort((a, b) => a.department.localeCompare(b.department)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load report.';
      setError(message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReport(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (value: string | null) => {
    if (value) setDateRange(value);
  };

  const totalPresent = useMemo(() => reportData.reduce((acc, d) => acc + d.present, 0), [reportData]);
  const totalLate = useMemo(() => reportData.reduce((acc, d) => acc + d.late, 0), [reportData]);
  const totalAbsent = useMemo(() => reportData.reduce((acc, d) => acc + d.absent, 0), [reportData]);
  const totalLeave = useMemo(() => reportData.reduce((acc, d) => acc + d.leave, 0), [reportData]);
  const grandTotal = totalPresent + totalLate + totalAbsent + totalLeave;
  const overallAttendanceRate = grandTotal > 0 ? (((totalPresent + totalLate) / grandTotal) * 100).toFixed(1) : '0.0';
  const presentPct = grandTotal > 0 ? Math.round((totalPresent / grandTotal) * 100) : 0;
  const latePct = grandTotal > 0 ? Math.round((totalLate / grandTotal) * 100) : 0;
  const absentPct = grandTotal > 0 ? Math.round((totalAbsent / grandTotal) * 100) : 0;
  const leavePct = grandTotal > 0 ? Math.round((totalLeave / grandTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Attendance Report</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Live data from attendance logs</p>
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
                <p className="text-xs text-green-500 mt-1">From attendance logs</p>
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
                <p className="text-xs text-amber-500 mt-1">From attendance logs</p>
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
                <p className="text-xs text-red-500 mt-1">No absent source yet</p>
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
                <p className="text-xs text-blue-500 mt-1">No leave source yet</p>
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
                  {loading && (
                    <tr>
                      <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400" colSpan={6}>
                        Loading attendance report...
                      </td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td className="py-6 px-4 text-sm text-red-500" colSpan={6}>
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && reportData.length === 0 && (
                    <tr>
                      <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400" colSpan={6}>
                        No attendance logs found for the selected period.
                      </td>
                    </tr>
                  )}
                  {!loading && !error && reportData.map((dept) => {
                    const deptTotal = dept.present + dept.late + dept.absent + dept.leave;
                    const rate = deptTotal > 0 ? (((dept.present + dept.late) / deptTotal) * 100).toFixed(1) : '0.0';
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
                      {overallAttendanceRate}%
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
                <div className="text-5xl font-bold dark:text-white">{overallAttendanceRate}%</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">Average Attendance Rate (Present + Late)</p>
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">Present</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${presentPct}%` }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">{presentPct}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">Late</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${latePct}%` }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">{latePct}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">Absent</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${absentPct}%` }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">{absentPct}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400">On Leave</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${leavePct}%` }} />
                    </div>
                    <span className="text-sm font-medium dark:text-white">{leavePct}%</span>
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