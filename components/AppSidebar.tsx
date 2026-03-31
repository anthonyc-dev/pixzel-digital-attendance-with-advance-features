'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Settings, 
  ChevronDown,
  LayoutDashboard,
  Moon,
  Sun,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  icon: any;
  href: string;
  hasSub?: boolean;
  subItems?: { name: string; href: string; badge?: string }[];
}

const sidebarItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/employee/employeeDashboard' },
  { name: 'Calendar', icon: Calendar, href: '/employee/employeeHome' },
  { 
    name: 'Activities', 
    icon: Clock, 
    href: '#', 
    hasSub: true,
    subItems: [
      { name: 'Attendance', href: '/employee/employeeDashboard' },
      { name: 'Leave', href: '#', badge: '02' }
    ]
  },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '#' },
];

const AppSidebar = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (v: boolean) => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [openMenus, setOpenMenus] = useState<string[]>(['Activities']);

  // Handle Dark Mode Toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleMenu = (name: string) => {
    if (isCollapsed) {
       setIsCollapsed(false);
       setOpenMenus([name]);
       return;
    }
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  return (
    <aside className={cn(
      "h-screen bg-white dark:bg-black border-r border-gray-100 dark:border-white/5 flex flex-col transition-all duration-500 ease-in-out relative font-sans overflow-hidden",
      isCollapsed ? "w-20" : "w-64"
    )}>

      <div className={cn(
        "relative flex items-center justify-end px-6 pt-8 pb-6",
        isCollapsed && "px-4"
      )}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center justify-center p-1 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-white transition-colors z-[60]",
            "hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <ChevronsLeft className="w-5 h-5" />
          )}
        </button>

        {/* Header / Logo */}
        {!isCollapsed && (
          <div className="absolute left-6 top-8 flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-xl shadow-lg shadow-secondary/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-primary dark:text-white uppercase transition-all duration-300">PIXZEL</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 min-h-0 space-y-1 px-4 overflow-y-auto no-scrollbar">
        {sidebarItems.map((item) => {
          const isMenuOpen = openMenus.includes(item.name);
          const isActive = pathname === item.href;
          
          return (
            <div key={item.name} className="space-y-1">
              <button 
                onClick={() => {
                  if (item.hasSub) {
                    toggleMenu(item.name);
                    return;
                  }

                  if (item.href && item.href !== '#') {
                    router.push(item.href);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group text-sm relative",
                  isActive 
                    ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                    : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-bold tracking-tight">{item.name}</span>}
                </div>
                
                {!isCollapsed && item.hasSub && (
                  <ChevronDown className={cn("w-4 h-4 opacity-30 transition-transform duration-300", isMenuOpen && "rotate-180")} />
                )}

                {isCollapsed && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full" />
                )}
              </button>
              
              {!isCollapsed && item.subItems && isMenuOpen && (
                <div className="ml-6 space-y-1 mt-1 border-l border-gray-100 dark:border-white/5 pl-4 py-1 animate-in slide-in-from-top-2 duration-300">
                  {item.subItems.map((sub) => (
                    <Link 
                      key={sub.name}
                      href={sub.href}
                      className={cn(
                        "flex items-center justify-between py-2 text-[11px] font-black uppercase tracking-widest transition-colors",
                        pathname === sub.href ? "text-secondary" : "text-gray-400 dark:text-gray-600 hover:text-primary dark:hover:text-white"
                      )}
                    >
                      <span>{sub.name}</span>
                      {sub.badge && (
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[9px] font-black">
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn("mt-auto shrink-0 space-y-6 p-4 pt-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black", isCollapsed && "px-0 items-center")}>
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <button key={item.name} className={cn("w-full flex items-center gap-3 p-3 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-white transition-all rounded-xl", isCollapsed && "justify-center px-0")}>
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div>

        {/* Theme Toggler Buttons */}
        <div className={cn(
          "p-1 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center shadow-inner border border-gray-100 dark:border-white/5 transition-all overflow-hidden",
          isCollapsed ? "flex-col gap-1 w-fit mx-auto" : "flex-row"
        )}>
          <button 
            onClick={() => toggleTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] uppercase font-black transition-all rounded-lg",
              theme === 'light' ? "bg-white text-primary shadow-sm ring-1 ring-gray-100" : "text-gray-400 hover:text-primary"
            )}
            title="Light Mode"
          >
            <Sun className="w-4 h-4" />
            {!isCollapsed && <span>Light</span>}
          </button>
          <button 
                onClick={() => toggleTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] uppercase font-black transition-all rounded-lg",
              theme === 'dark' ? "bg-black dark:bg-white/10 text-white shadow-sm ring-1 ring-white/10" : "text-gray-500 hover:text-white"
            )}
            title="Dark Mode"
          >
            <Moon className="w-4 h-4" />
            {!isCollapsed && <span>Dark</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
