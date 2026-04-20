'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Save } from 'lucide-react';

export default function CutoffDate() {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [cutoffDate, setCutoffDate] = useState('');

  const isValid = Boolean(periodStart && periodEnd && cutoffDate);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Cutoff Date</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Set payroll coverage and cutoff for the next run.</p>
        </div>
        <Button disabled={!isValid} className="bg-secondary hover:bg-secondary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Cutoff
        </Button>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Payroll Period Setup</CardTitle>
          <CardDescription className="dark:text-gray-400">Configure start/end period and processing cutoff.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Period Start</Label>
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Period End</Label>
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cutoff Date</Label>
            <Input type="date" value={cutoffDate} onChange={(e) => setCutoffDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-white/10">
        <CardContent className="p-6 flex items-start gap-3">
          <CalendarDays className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium dark:text-white">Run Preview</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Start: {periodStart || 'Not set'} | End: {periodEnd || 'Not set'} | Cutoff: {cutoffDate || 'Not set'}
            </p>
            <div className="mt-2">
              <Badge variant={isValid ? 'default' : 'secondary'}>
                {isValid ? 'Ready for review step' : 'Missing required dates'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}