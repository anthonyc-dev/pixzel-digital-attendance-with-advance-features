'use client';

import React, { useState } from 'react';
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
  Plus,
  CreditCard,
  DollarSign,
  Calendar
} from 'lucide-react';
import { deductions } from '@/lib/mock-data';

export default function OtherDeductionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleTypeFilterChange = (value: string | null) => {
    if (value) setTypeFilter(value);
  };

  const filteredDeductions = deductions.filter(deduction => {
    const matchesSearch = deduction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deduction.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || deduction.type.toLowerCase().includes(typeFilter);
    return matchesSearch && matchesType;
  });

  const totalSSS = deductions.filter(d => d.type === 'SSS').reduce((acc, d) => acc + d.amount, 0);
  const totalPhilHealth = deductions.filter(d => d.type === 'PhilHealth').reduce((acc, d) => acc + d.amount, 0);
  const totalPagIBIG = deductions.filter(d => d.type === 'Pag-IBIG').reduce((acc, d) => acc + d.amount, 0);
  const totalLoans = deductions.filter(d => d.type === 'Loan Deduction').reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Other Deductions</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">Manage SSS, PhilHealth, Pag-IBIG and other deductions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="dark:border-white/20 dark:text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Deduction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">SSS</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalSSS.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">PhilHealth</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalPhilHealth.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Pag-IBIG</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalPagIBIG.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Loan Deductions</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">₱{totalLoans.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-black dark:border-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="dark:text-white">Deduction Records</CardTitle>
              <CardDescription className="dark:text-gray-400">All deduction entries for current period</CardDescription>
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
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-full sm:w-40 dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="Deduction Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-black dark:border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sss">SSS</SelectItem>
                  <SelectItem value="philhealth">PhilHealth</SelectItem>
                  <SelectItem value="pag-ibig">Pag-IBIG</SelectItem>
                  <SelectItem value="loan">Loan Deduction</SelectItem>
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
                <TableHead className="dark:text-gray-400">Deduction Type</TableHead>
                <TableHead className="dark:text-gray-400">Period</TableHead>
                <TableHead className="text-right dark:text-gray-400">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeductions.map((deduction) => (
                <TableRow key={deduction.id} className="dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-white text-xs">
                          {deduction.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{deduction.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{deduction.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                      {deduction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{deduction.period}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium dark:text-white">₱{deduction.amount.toLocaleString()}</span>
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