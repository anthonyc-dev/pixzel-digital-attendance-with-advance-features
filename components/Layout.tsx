'use client';

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-white dark:bg-black min-h-screen text-primary dark:text-white font-sans transition-colors duration-500 selection:bg-secondary/40">
      <AppSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <main className={cn(
        "flex-1 flex flex-col p-8 overflow-y-auto relative transition-all duration-500",
        isCollapsed ? "ml-0" : "ml-0" // flex-1 handles it, no margin needed
      )}>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between mb-10 w-full z-10 sticky top-0 py-2 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-gray-100 dark:border-white/5 transition-colors">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-primary dark:group-hover:text-white transition-colors" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 flex gap-1 items-center bg-gray-50 dark:bg-white/5 uppercase">
              <span>⌘</span>
              <span>K</span>
            </div>
            <input 
              type="text" 
              placeholder="Quick Search..." 
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-sm font-bold text-primary dark:text-white placeholder:text-gray-400 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]" 
            />
          </div>

          <div className="flex items-center gap-6 ml-6">
            <button className="p-3 bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white transition-all shadow-sm group">
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button className="relative p-3 bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white transition-all shadow-sm group">
              <Bell className="w-5 h-5 group-hover:shake transition-transform" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-white dark:border-black shadow-sm" />
            </button>
            
            <div className="h-10 w-[1px] bg-gray-100 dark:bg-white/10 mx-2" />
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="p-0.5 bg-gradient-to-tr from-secondary to-orange-500 rounded-xl shadow-md">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-black">
                  <Image src="https://ui-avatars.com/api/?name=Washi+Mazumder&background=fdf2f8&color=c01148&bold=true" alt="Avatar" width={40} height={40} />
                </div>
              </div>
              <div className="flex flex-col text-sm">
                <span className="font-black text-primary dark:text-white tracking-tight">Washi Mazumder</span>
                <span className="text-[10px] text-secondary font-black uppercase tracking-widest">UI Specialist</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-white group-hover:translate-y-0.5 transition-all" />
            </div>
          </div>
        </header>

        {/* Content Area Rendering */}
        <div className="relative z-0 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
