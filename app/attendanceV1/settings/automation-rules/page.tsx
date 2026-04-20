'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Settings,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const mockRules = [
  { id: 1, name: "Auto-approve Overtime", description: "Automatically approve overtime requests under 2 hours", status: true, trigger: "Overtime < 2hrs" },
  { id: 2, name: "Leave Balance Warning", description: "Notify employees when leave balance is below 3 days", status: true, trigger: "Leave < 3 days" },
  { id: 3, name: "Attendance Sync", description: "Sync attendance data from biometric devices daily", status: true, trigger: "Daily 12:00 AM" },
  { id: 4, name: "Payroll Generation", description: "Automatically generate payroll on cutoff dates", status: false, trigger: "Cutoff Date" },
  { id: 5, name: "Loan Deduction", description: "Auto-deduct loan payments from salary", status: true, trigger: "Payroll Processing" },
];

export default function AutomationRulesPage() {
  const activeRules = mockRules.filter(r => r.status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Automation Rules</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Configure automated processes and triggers</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90">
          <Zap className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Rules</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockRules.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{activeRules}</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockRules.length - activeRules}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="dark:text-white">Automation Rules</CardTitle>
            <CardDescription className="dark:text-gray-400">Manage all automation rules</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-white/5 hover:bg-transparent">
                <TableHead className="dark:text-gray-400">Rule Name</TableHead>
                <TableHead className="dark:text-gray-400">Description</TableHead>
                <TableHead className="dark:text-gray-400">Trigger</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRules.map((rule) => (
                <TableRow key={rule.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell className="font-medium dark:text-white">{rule.name}</TableCell>
                  <TableCell className="dark:text-gray-400 text-sm max-w-[250px]">{rule.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                      {rule.trigger}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={rule.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                      Edit
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