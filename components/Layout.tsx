'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mainRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const handleSetIsCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem('sidebar-collapsed', val.toString());
  };

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', () => {}, { passive: true });
    }
  }, []);

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
        setIsCollapsed={handleSetIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <main 
        ref={mainRef}
        className={cn(
          "flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto relative transition-all duration-300 min-h-0 bg-[#f5f5f5] dark:bg-[#0a0a0a]",
        )}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between sticky top-0 z-30 py-2 backdrop-blur-lg">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />
        
        {/* Content Area Rendering */}
        <div className="relative z-0 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
