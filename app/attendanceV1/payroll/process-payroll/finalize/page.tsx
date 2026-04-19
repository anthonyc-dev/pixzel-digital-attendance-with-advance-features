'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Send } from 'lucide-react';

export default function FinalizePayroll() {
  const [confirmed, setConfirmed] = useState(false);
  const [publishPayslip, setPublishPayslip] = useState(true);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Finalize Payroll</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Lock payroll run, generate payslips, and prepare posting.</p>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-white">Finalization Checklist</CardTitle>
          <CardDescription className="dark:text-gray-400">All items should be reviewed before posting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border dark:border-white/10">
            <p className="text-sm">Auto-calculations reviewed</p>
            <Badge>Done</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border dark:border-white/10">
            <p className="text-sm">Exceptions resolved</p>
            <Badge variant="secondary">Pending validation</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="publish" checked={publishPayslip} onCheckedChange={(v) => setPublishPayslip(Boolean(v))} />
            <Label htmlFor="publish">Generate and publish payslips after finalization</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} />
            <Label htmlFor="confirm">I confirm payroll values are reviewed and ready to lock.</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-white/10">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium dark:text-white">Finalization will lock this payroll run.</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Further changes require adjustment entries, not direct edits.</p>
            </div>
          </div>
          <Button disabled={!confirmed} className="bg-secondary hover:bg-secondary/90">
            <Send className="w-4 h-4 mr-2" />
            Finalize & Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}