'use client';

import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Menu } from 'lucide-react';
import Image from 'next/image';

interface AdminHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

const AdminHeader = ({ isCollapsed, setIsCollapsed }: AdminHeaderProps) => {
  return (
    <header className="flex items-center justify-between w-full z-10  py-3 px-6 bg-background/80 dark:bg-black/50 backdrop-blur-xl border-b border-border transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 lg:hidden hover:bg-muted rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[9px] font-bold text-muted-foreground border border-border rounded-lg px-2 py-1 bg-muted uppercase">
            <span>⌘</span>
            <span>K</span>
          </div>
          <input
            type="text"
            placeholder="Search employees, reports, settings..."
            className="w-full bg-muted border border-border rounded-2xl py-3 pl-11 pr-14 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 bg-muted text-muted-foreground border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all">
          <MessageSquare className="w-5 h-5" />
        </button>

        <button className="relative p-2.5 bg-muted text-muted-foreground border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-background shadow-sm" />
        </button>

        <div className="h-8 w-[1px] bg-border mx-1" />

        <div className="flex items-center gap-3 cursor-pointer group p-2 -m-2 rounded-xl hover:bg-muted transition-colors">
          <div className="p-0.5 bg-gradient-to-tr from-secondary to-pink-600 rounded-xl">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-background">
              <Image
                src="https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff&bold=true"
                alt="Admin Avatar"
                width={40}
                height={40}
              />
            </div>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold text-foreground">Admin User</span>
            <span className="text-xs text-secondary font-medium">Administrator</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-y-0.5 transition-all" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
