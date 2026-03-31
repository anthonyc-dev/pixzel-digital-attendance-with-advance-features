'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Standard approach to set time once client-side to avoid hydration mismatch
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time and date safely
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
    <main className="min-h-screen bg-primary text-tertiary flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-4xl z-10 flex flex-col items-center gap-12">
        
        {/* Branding */}
        <header className="flex items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="p-3 bg-secondary rounded-2xl shadow-[0_0_20px_rgba(192,17,72,0.4)]">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              PIXZEL
            </h1>
            <span className="text-secondary font-semibold text-sm tracking-widest uppercase">
              Digital Attendance
            </span>
          </div>
        </header>

        {/* Time and Date Section */}
        <section className="text-center space-y-4 animate-in fade-in scale-in duration-1000 delay-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-sm backdrop-blur-md">
            <Calendar className="w-4 h-4" />
            {time ? formatDate(time) : 'Loading date...'}
          </div>
          
          <div className="text-7xl md:text-9xl font-mono font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {time ? formatTime(time) : '--:--:--'}
          </div>
          
          <p className="text-white/40 text-lg md:text-xl font-light">
            Please select your action below to continue
          </p>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          
          {/* Check In Card */}
          <button 
            className="group relative flex flex-col items-center justify-center p-12 bg-secondary border-2 border-secondary rounded-[3rem] shadow-[0_15px_30px_rgba(192,17,72,0.25)] hover:shadow-[0_20px_50px_rgba(192,17,72,0.4)] hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <LogIn className="w-32 h-32" />
            </div>
            
            <div className="p-5 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">CHECK IN</h2>
            <p className="text-white/80 text-sm uppercase tracking-widest font-semibold">Start your shift</p>
          </button>

          {/* Check Out Card */}
          <button 
            className="group relative flex flex-col items-center justify-center p-12 bg-white/5 border-2 border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <LogOut className="w-32 h-32" />
            </div>
            
            <div className="p-5 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <LogOut className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 uppercase">Check Out</h2>
            <p className="text-white/40 text-sm uppercase tracking-widest font-semibold">End your shift</p>
          </button>

        </section>

        {/* Footer */}
        <footer className="mt-8 text-white/20 text-xs tracking-widest uppercase flex items-center gap-2">
          <span>Secure System</span>
          <div className="w-1 h-1 bg-secondary rounded-full" />
          <span>v1.0.4 - PIXZEL CORP</span>
        </footer>
      </div>

    </main>
  );
}
