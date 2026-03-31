'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar, ShieldCheck, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-500">

      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 dark:bg-secondary/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-4xl z-10 flex flex-col items-center gap-12">

        {/* Branding */}
        <header className="flex items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="p-3 bg-secondary rounded-2xl shadow-lg shadow-secondary/40">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
              PIXZEL
            </h1>
            <span className="text-secondary font-semibold text-sm tracking-widest uppercase">
              Digital Attendance
            </span>
          </div>
        </header>

        {/* Time and Date Section */}
        <section className="text-center space-y-4 animate-in fade-in scale-in duration-1000 delay-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-full text-muted-foreground dark:text-white/60 text-sm backdrop-blur-md">
            <Calendar className="w-4 h-4" />
            {time ? formatDate(time) : 'Loading date...'}
          </div>

          <div className="text-7xl md:text-9xl font-mono font-bold tracking-tight text-foreground drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {time ? formatTime(time) : '--:--:--'}
          </div>

          <p className="text-muted-foreground/60 dark:text-white/40 text-lg md:text-xl font-light italic">
            Ready to log your presence? Select an option below.
          </p>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom duration-1000 delay-500">

          {/* Dashboard Link */}
          <Link
            href="/admin/adminDashboard"
            className="group relative flex flex-col items-center justify-center p-12 bg-secondary border-2 border-secondary rounded-[3rem] shadow-xl shadow-secondary/20 hover:shadow-2xl hover:shadow-secondary/40 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <LayoutDashboard className="w-32 h-32 text-white" />
            </div>

            <div className="p-5 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase">Dashboard</h2>
            <p className="text-white/80 text-xs uppercase tracking-widest font-black">View Attendance Records</p>
          </Link>

          {/* Home/Calendar Link */}
          <Link
            href="/admin/adminCalendar"
            className="group relative flex flex-col items-center justify-center p-12 bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-[3rem] shadow-sm hover:shadow-xl dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.08] dark:group-hover:opacity-10 transition-opacity">
              <Calendar className="w-32 h-32 text-foreground" />
            </div>

            <div className="p-5 bg-gray-50 dark:bg-white/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-100 dark:border-transparent">
              <Calendar className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2 uppercase tracking-tight">Schedule</h2>
            <p className="text-muted-foreground/60 dark:text-white/40 text-xs uppercase tracking-widest font-black">Check Your Shifts</p>
          </Link>

        </section>

        {/* Footer */}
        <footer className="mt-8 text-muted-foreground/30 dark:text-white/20 text-[10px] tracking-widest uppercase font-black flex items-center gap-2">
          <span>Secure Authentication</span>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
          <span>v1.0.4 - PIXZEL CORP</span>
        </footer>
      </div>

    </main>
  );
}
