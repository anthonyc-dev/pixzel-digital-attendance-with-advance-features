'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Plus,
  RotateCw,
  Clock,
  Calendar,
  User
} from 'lucide-react';
import { employees } from '@/lib/mock-data';

const mockOverrides = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", originalHours: 2.0, adjustedHours: 3.5, reason: "Project deadline extension", adjustedBy: "Admin", date: "2026-04-10" },
  { id: 2, employeeId: "EMP003", name: "Robert Chen", originalHours: 1.5, adjustedHours: 2.0, reason: "Client meeting overflow", adjustedBy: "HR Manager", date: "2026-04-08" },
  { id: 3, employeeId: "EMP006", name: "Emily White", originalHours: 0, adjustedHours: 1.0, reason: "System maintenance", adjustedBy: "Admin", date: "2026-04-07" },
];

export default function OvertimeManualOverridePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOverrides = mockOverrides.filter(override => {
    return override.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           override.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalAdjusted = mockOverrides.reduce((acc, o) => acc + (o.adjustedHours - o.originalHours), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Overtime Manual Override</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Manually adjust employee overtime records</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total Adjustments</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{mockOverrides.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <RotateCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Hours Adjusted</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">+{totalAdjusted.toFixed(1)} hrs</p>
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
                <p className="text-sm text-muted-foreground dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">3</p>
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
              <CardTitle className="dark:text-white">Adjustment History</CardTitle>
              <CardDescription className="dark:text-gray-400">Record of all manual overtime adjustments</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search employee..." 
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
                <TableHead className="dark:text-gray-400">Employee</TableHead>
                <TableHead className="dark:text-gray-400">Original Hours</TableHead>
                <TableHead className="dark:text-gray-400">Adjusted Hours</TableHead>
                <TableHead className="dark:text-gray-400">Difference</TableHead>
                <TableHead className="dark:text-gray-400">Reason</TableHead>
                <TableHead className="dark:text-gray-400">Adjusted By</TableHead>
                <TableHead className="dark:text-gray-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOverrides.map((override) => (
                <TableRow key={override.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {override.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{override.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{override.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{override.originalHours.toFixed(1)} hrs</TableCell>
                  <TableCell className="dark:text-gray-300">{override.adjustedHours.toFixed(1)} hrs</TableCell>
                  <TableCell>
                    <span className="font-medium text-green-500 dark:text-green-400">
                      +{(override.adjustedHours - override.originalHours).toFixed(1)} hrs
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-gray-400 text-sm max-w-[150px] truncate">{override.reason}</TableCell>
                  <TableCell className="dark:text-gray-300">{override.adjustedBy}</TableCell>
                  <TableCell className="dark:text-gray-300">{new Date(override.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}