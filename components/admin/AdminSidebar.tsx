'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Sun,
  Moon,
  ClipboardList,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasSub?: boolean;
  subItems?: { name: string; href: string; badge?: string }[];
}

const adminSidebarItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Employees', icon: Users, href: '/admin/employees' },
  { name: 'Attendance', icon: ClipboardList, href: '/admin/attendance' },
  { name: 'Calendar', icon: Calendar, href: '/admin/calendar' },
  { name: 'Company', icon: Building2, href: '/admin/company', hasSub: true, subItems: [{ name: 'Profile', href: '/admin/company/profile' }, { name: 'Departments', href: '/admin/company/departments' }] },
  { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
  { name: 'Payroll', icon: DollarSign, href: '/admin/payroll' },
  { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

const AdminSidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  //   if (savedTheme) {
  //     setTheme(savedTheme);
  //     document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  //   } else {
  //     document.documentElement.classList.add('dark');
  //   }
  // }, []);

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
      "min-h-screen bg-background border-r border-border flex flex-col transition-all duration-500 ease-in-out relative font-sans overflow-hidden",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-70 top-10 bg-secondary text-secondary-foreground w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-background hover:scale-110 active:scale-95 transition-all z-50"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
      </button>

      <div className={cn("flex items-center gap-3 mb-10 px-6 pt-8", isCollapsed && "px-0 justify-center")}>
        <div className="p-2.5 bg-gradient-to-br from-secondary to-pink-600 rounded-xl shadow-lg shadow-secondary/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-foreground uppercase">PIXZEL</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin Panel</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 overflow-y-auto no-scrollbar">
        {adminSidebarItems.map((item) => {
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
                    // Navigation handled by Link
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group text-sm relative",
                  isActive
                    ? "bg-gradient-to-r from-secondary to-pink-600 text-secondary-foreground shadow-lg shadow-secondary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-semibold">{item.name}</span>}
                </div>

                {!isCollapsed && item.hasSub && (
                  <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform duration-300", isMenuOpen && "rotate-180")} />
                )}

                {isCollapsed && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full" />
                )}
              </button>

              {!isCollapsed && item.subItems && isMenuOpen && (
                <div className="ml-6 space-y-1 mt-1 border-l-2 border-secondary/20 pl-4 py-2 animate-in slide-in-from-top-2 duration-300">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={cn(
                        "flex items-center justify-between py-2 text-xs font-medium transition-colors rounded-lg px-2",
                        pathname === sub.href ? "text-secondary bg-secondary/10" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{sub.name}</span>
                      {sub.badge && (
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-bold">
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

      <div className={cn("mt-auto space-y-4 p-4 pt-6 border-t border-border", isCollapsed && "px-2 items-center")}>
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <button key={item.name} className={cn("w-full flex items-center gap-3 p-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all rounded-xl hover:bg-muted", isCollapsed && "justify-center px-0")}>
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div>

        <div className={cn(
          "p-1 bg-muted rounded-xl flex border border-border",
          isCollapsed ? "flex-col gap-1 w-fit mx-auto" : "flex-row"
        )}>
          <button
            onClick={() => toggleTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] uppercase font-bold transition-all rounded-lg",
              theme === 'light' ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun className="w-4 h-4" />
            {!isCollapsed && <span>Light</span>}
          </button>
          <button
            onClick={() => toggleTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] uppercase font-bold transition-all rounded-lg",
              theme === 'dark' ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="w-4 h-4" />
            {!isCollapsed && <span>Dark</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
