'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Download,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer
} from 'lucide-react';
import { ENV } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';

type ApiAttendanceLog = {
  id: string;
  type: 'time_in' | 'time_out';
  status: string;
  timestamp: string;
  employer_registration?: {
    employer_id?: string;
    employer_name?: string;
  };
};

type AttendanceRow = {
  id: string;
  name: string;
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  hoursWorked: number;
  overtime: number;
  status: 'Present' | 'Late' | 'On Leave' | 'Absent';
};

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function computeHours(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return ms / (1000 * 60 * 60);
}

export default function AttendanceLogPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(() => toDateInputValue(new Date()));
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const handleStatusFilterChange = (value: string | null) => {
    if (value) setStatusFilter(value);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        let resolvedEmployeeId = employeeId;

        if (!resolvedEmployeeId) {
          const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
          if (!sessionRes.ok) {
            throw new Error('Unable to identify logged-in employee');
          }
          const sessionPayload = (await sessionRes.json()) as {
            employerCode?: string | null;
            role?: 'admin' | 'employee' | null;
          };

          if (sessionPayload.role === 'employee' && sessionPayload.employerCode) {
            resolvedEmployeeId = String(sessionPayload.employerCode);
          } else {
            // Fallback for legacy Supabase-authenticated users.
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
              throw new Error('Unable to identify logged-in employee');
            }

            const { data: employerRow, error: employerError } = await supabase
              .from('employer_registration')
              .select('employer_id')
              .eq('auth_user_id', user.id)
              .maybeSingle();

            if (employerError || !employerRow?.employer_id) {
              throw new Error('Employee profile not linked to account');
            }

            resolvedEmployeeId = String(employerRow.employer_id);
          }

          setEmployeeId(resolvedEmployeeId);
        }

        const response = await fetch(
          `${ENV.API_URL}/attendance?start_date=${encodeURIComponent(dateFilter)}&end_date=${encodeURIComponent(dateFilter)}`,
          { cache: 'no-store' },
        );
        if (!response.ok) {
          throw new Error('Failed to load attendance logs');
        }

        const logs = (await response.json()) as ApiAttendanceLog[];
        const grouped = new Map<string, AttendanceRow>();

        for (const log of logs) {
          const empId = log.employer_registration?.employer_id ?? 'Unknown';
          if (empId !== resolvedEmployeeId) continue;
          const empName = log.employer_registration?.employer_name ?? 'Unknown';
          const rowKey = `${empId}-${dateFilter}`;

          if (!grouped.has(rowKey)) {
            grouped.set(rowKey, {
              id: rowKey,
              name: empName,
              employeeId: empId,
              date: dateFilter,
              timeIn: '-',
              timeOut: '-',
              hoursWorked: 0,
              overtime: 0,
              status: 'Present',
            });
          }

          const row = grouped.get(rowKey)!;

          if (log.type === 'time_in') {
            row.timeIn = formatTime(log.timestamp);
            row.status = log.status === 'late' ? 'Late' : 'Present';
            row.id = log.id;
          } else if (log.type === 'time_out') {
            row.timeOut = formatTime(log.timestamp);
            row.id = log.id;
          }
        }

        for (const row of grouped.values()) {
          if (row.timeIn !== '-' && row.timeOut !== '-') {
            const matchingTimeIn = logs.find(
              (l) =>
                l.type === 'time_in' &&
                (l.employer_registration?.employer_id ?? 'Unknown') === row.employeeId,
            );
            const matchingTimeOut = logs.find(
              (l) =>
                l.type === 'time_out' &&
                (l.employer_registration?.employer_id ?? 'Unknown') === row.employeeId,
            );

            if (matchingTimeIn && matchingTimeOut) {
              row.hoursWorked = computeHours(matchingTimeIn.timestamp, matchingTimeOut.timestamp);
              row.overtime = Math.max(0, row.hoursWorked - 8);
            }
          }
        }

        setRows(Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load attendance logs';
        setError(message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchLogs();
  }, [dateFilter, employeeId, supabase]);

  const filteredLogs = rows.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase().replace(' ', '-') === statusFilter;
    const matchesDate = log.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present': return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Late': return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{status}</Badge>;
      case 'On Leave': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 dark:text-blue-400">{status}</Badge>;
      case 'Absent': return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const presentCount = useMemo(() => rows.filter(l => l.status === 'Present').length, [rows]);
  const lateCount = useMemo(() => rows.filter(l => l.status === 'Late').length, [rows]);
  const onLeaveCount = useMemo(() => rows.filter(l => l.status === 'On Leave').length, [rows]);
  const totalHours = useMemo(() => rows.reduce((acc, l) => acc + l.hoursWorked, 0), [rows]);

  return (
    <div className="flex flex-col p-4 md:p-6 lg:p-8 gap-4 sm:gap-5 w-full mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-6 lg:pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Attendance Log</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Track and monitor attendance logs from database</p>
        </div>
        <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Present</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{presentCount}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Late</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{lateCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">On Leave</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{onLeaveCount}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{totalHours.toFixed(1)}h</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Timer className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Daily Attendance</CardTitle>
              <CardDescription className="dark:text-gray-400">Employee attendance for selected date</CardDescription>
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
              <Input
                type="date"
                className="attendance-date-input w-full sm:w-40 dark:bg-white/5 dark:border-white/10"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-white/5 dark:border-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
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
                <TableHead className="dark:text-gray-400">Date</TableHead>
                <TableHead className="dark:text-gray-400">Time In</TableHead>
                <TableHead className="dark:text-gray-400">Time Out</TableHead>
                <TableHead className="dark:text-gray-400">Hours Worked</TableHead>
                <TableHead className="dark:text-gray-400">Overtime</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading attendance logs...
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No attendance logs found for this date/filter.
                  </TableCell>
                </TableRow>
              )}
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {log.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{log.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{log.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell className="dark:text-gray-300">{log.timeIn}</TableCell>
                  <TableCell className="dark:text-gray-300">{log.timeOut}</TableCell>
                  <TableCell className="dark:text-gray-300">{log.hoursWorked.toFixed(2)}h</TableCell>
                  <TableCell>
                    {log.overtime > 0 ? (
                      <span className="text-green-500 dark:text-green-400">+{log.overtime.toFixed(2)}h</span>
                    ) : (
                      <span className="text-muted-foreground dark:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <style jsx global>{`
        .dark .attendance-date-input::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(1.6);
          opacity: 1;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
