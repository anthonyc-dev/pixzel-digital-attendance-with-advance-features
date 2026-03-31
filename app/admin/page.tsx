'use client';

import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const stats = [
  {
    title: 'Total Employees',
    value: '248',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Present Today',
    value: '198',
    change: '+8%',
    trend: 'up',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-green-500'
  },
  {
    title: 'Absent Today',
    value: '12',
    change: '-5%',
    trend: 'down',
    icon: XCircle,
    color: 'from-red-500 to-orange-500'
  },
  {
    title: 'On Leave',
    value: '38',
    change: '+3%',
    trend: 'up',
    icon: Calendar,
    color: 'from-secondary to-pink-600'
  },
];

const recentActivity = [
  { name: 'John Doe', action: 'Clocked In', time: '2 min ago', status: 'success' },
  { name: 'Sarah Smith', action: 'Requested Leave', time: '15 min ago', status: 'pending' },
  { name: 'Mike Johnson', action: 'Clocked Out', time: '1 hour ago', status: 'success' },
  { name: 'Emily Brown', action: 'Missed Attendance', time: '2 hours ago', status: 'error' },
];

const upcomingEvents = [
  { title: 'Team Meeting', time: '10:00 AM', attendees: 12 },
  { title: 'Project Review', time: '2:00 PM', attendees: 5 },
  { title: 'Training Session', time: '4:30 PM', attendees: 20 },
];

const AdminPage = () => {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md dark:shadow-none dark:bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-3 rounded-2xl bg-gradient-to-br shadow-lg",
                  stat.color
                )}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  stat.trend === 'up' ? "text-emerald-500" : "text-red-500"
                )}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md dark:shadow-none dark:bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      activity.status === 'success' ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        activity.status === 'pending' ? "bg-amber-100 dark:bg-amber-900/30" :
                          "bg-red-100 dark:bg-red-900/30"
                    )}>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : activity.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:shadow-none dark:bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  <div className="w-1 h-12 bg-gradient-to-b from-secondary to-pink-600 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{event.attendees}</p>
                    <p className="text-xs text-muted-foreground">attending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
