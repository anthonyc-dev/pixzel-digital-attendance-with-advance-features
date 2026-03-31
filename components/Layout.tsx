import React from 'react';
import AppSidebar from './AppSidebar';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-white min-h-screen font-sans">
      <AppSidebar />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Top Navbar */}
        <header className="flex items-center justify-between mb-10 w-full">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 border border-gray-100 rounded px-1 flex gap-1 items-center">
              <span>⌘</span>
              <span>+</span>
              <span>S</span>
              <span className="ml-1 text-gray-400">Quick search</span>
            </div>
            <input 
              type="text" 
              placeholder="Search anything ..." 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary/30 transition-all text-sm font-medium" 
            />
          </div>

          <div className="flex items-center gap-6 ml-6">
            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-primary transition-all">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="relative p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-primary transition-all">
              <Bell className="w-5 h-5" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-white shadow-sm" />
            </button>
            
            <div className="h-10 w-[1px] bg-gray-100 mx-1" />
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gray-50 group-hover:ring-secondary/30 transition-all">
                <Image src="https://ui-avatars.com/api/?name=Washi+Mazumder&background=fdf2f8&color=c01148&bold=true" alt="Avatar" width={40} height={40} />
              </div>
              <div className="flex flex-col text-sm">
                <span className="font-bold text-primary">Washi Mazumder</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">UI Specialist</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
            </div>
          </div>
        </header>

        {/* Content */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
