'use client';

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const hideQuickSearch = pathname === '/employee/attendance' || pathname === '/admin/employerRegistration';

  return (
    <div className="flex bg-white dark:bg-black h-screen overflow-hidden text-primary dark:text-white font-sans transition-colors duration-500 selection:bg-secondary/40">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <AppSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <main className={cn(
        "flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto relative transition-all duration-500 min-h-0",
        isCollapsed ? "ml-0" : "ml-0"
      )}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4 md:mb-6">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />
        
        {/* Top Navbar */}
        {!hideQuickSearch && (
          <header className="hidden md:flex items-center justify-between mb-6 lg:mb-10 w-full z-10 sticky top-0 py-2 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-2xl px-4 border border-gray-100 dark:border-white/5 transition-colors">
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
          </header>
        )}

        {/* Content Area Rendering */}
        <div className="relative z-0 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
