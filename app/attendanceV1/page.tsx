'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { dashboardStats, attendanceLogs, employees } from '@/lib/mock-data';
import { ENV } from '@/lib/api';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) => (
  <Card className="dark:bg-black dark:border-white/10 hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const todayAttendance = attendanceLogs.filter(log => log.date === "2026-04-11");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Dashboard</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Welcome back! Here&apos;s your attendance overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
            <Calendar className="w-3 h-3 mr-1" />
            April 11, 2026
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Employees" 
          value={dashboardStats.totalEmployees.toString()} 
          icon={Users} 
          trend="up"
          trendValue="2"
          color="bg-blue-500"
        />
        <StatCard 
          title="Present Today" 
          value={dashboardStats.presentToday.toString()} 
          icon={CheckCircle2} 
          trend="up"
          trendValue="5%"
          color="bg-green-500"
        />
        <StatCard 
          title="On Leave" 
          value={dashboardStats.onLeave.toString()} 
          icon={Clock} 
          color="bg-amber-500"
        />
        <StatCard 
          title="Absent" 
          value={dashboardStats.absent.toString()} 
          icon={XCircle} 
          color="bg-red-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold dark:text-white">Today&apos;s Attendance</CardTitle>
              <CardDescription className="dark:text-gray-400">Real-time attendance log for today</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="dark:border-white/20 dark:text-gray-300">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAttendance.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-secondary text-white">
                        {log.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{log.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">{log.timeIn} - {log.timeOut}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={log.status === 'Present' ? 'default' : log.status === 'Late' ? 'secondary' : 'destructive'}
                      className={log.status === 'Present' ? 'bg-green-500' : ''}
                    >
                      {log.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{log.hoursWorked.toFixed(1)}h</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold dark:text-white">Quick Stats</CardTitle>
              <CardDescription className="dark:text-gray-400">Overview of key metrics</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="dark:text-gray-400">Total Overtime This Month</span>
                  <span className="font-semibold dark:text-white">{dashboardStats.totalOvertime}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="dark:text-gray-400">Total Deductions</span>
                  <span className="font-semibold dark:text-white">{dashboardStats.totalDeductions}</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="dark:text-gray-400">Payroll This Month</span>
                  <span className="font-semibold dark:text-white">{dashboardStats.payrollThisMonth}</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold dark:text-white">Pending Approvals</CardTitle>
            <CardDescription className="dark:text-gray-400">Items awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium dark:text-white">Leave Requests</span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  5
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium dark:text-white">Overtime Claims</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  4
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium dark:text-white">Loan Applications</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                  3
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 dark:bg-black dark:border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold dark:text-white">Department Overview</CardTitle>
            <CardDescription className="dark:text-gray-400">Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Engineering', count: 2, color: 'bg-blue-500' },
                { name: 'Design', count: 1, color: 'bg-purple-500' },
                { name: 'Marketing', count: 1, color: 'bg-green-500' },
                { name: 'Human Resources', count: 1, color: 'bg-pink-500' },
                { name: 'Finance', count: 1, color: 'bg-amber-500' },
                { name: 'Operations', count: 1, color: 'bg-cyan-500' },
                { name: 'Sales', count: 1, color: 'bg-red-500' },
              ].map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                    <span className="text-sm dark:text-gray-300">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(dept.count / 8) * 100} className="w-24 h-2" />
                    <span className="text-sm font-medium dark:text-white">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}