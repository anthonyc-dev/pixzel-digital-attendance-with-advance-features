'use client';

import React, { useState } from 'react';
import AppSidebar from './components/AppSidebar';

export default function AttendanceV1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <AppSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 sticky top-0 z-20">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm">Attendance V1</span>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-background/60">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}