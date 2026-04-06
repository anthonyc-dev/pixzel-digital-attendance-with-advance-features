'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Calendar,
  Clock,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
  X,
  LogOut,
  Users,
  ClipboardCheck,
  Banknote,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasSub?: boolean;
  subItems?: { name: string; href: string; badge?: string }[];
}

const sidebarItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/adminDashboard' },
  { 
    name: 'Employers', 
    icon: Users, 
    href: '/admin/employer',
    hasSub: true,
    subItems: [
      { name: 'List', href: '/admin/employer' },
      { name: 'Register', href: '/admin/employerRegistration' },
    ]
  },
  { name: 'DTR', icon: ClipboardCheck, href: '/admin/dtr' },
  { 
    name: 'Payroll', 
    icon: Banknote, 
    href: '/admin/payroll',
    hasSub: true,
    subItems: [
      { name: 'Run Payroll', href: '/admin/payroll' },
      { name: 'Deductions', href: '/admin/deduction' },
      { name: 'Leaves', href: '/admin/leaves' },
    ]
  },
  { name: 'Calendar', icon: Calendar, href: '/admin/adminCalendar' },
  {
    name: 'Activities',
    icon: Clock,
    href: '/admin/activities',
  },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '#' },
  { name: 'Logout', icon: LogOut, href: '/auth/login', isLogout: true },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (v: boolean) => void;
}

const AppSidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: AppSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [openMenus, setOpenMenus] = useState<string[]>(['Employers', 'Payroll']);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsImageLoaded(true);
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setIsImageLoaded(false);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleNavClick = (item: NavItem) => {
    if (item.hasSub) {
      toggleMenu(item.name);
      return;
    }
    // Mobile menu closing is handled on the Link onClick
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex h-screen bg-white dark:bg-black border-r border-gray-100 dark:border-white/5 flex-col transition-all duration-300 ease-out relative font-sans overflow-hidden",
        isCollapsed ? "w-20" : "w-52 xl:w-64"
      )}>
        <div className={cn(
          "relative flex items-center justify-end px-4 pt-6 pb-4",
          isCollapsed && "px-2"
        )}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center justify-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors z-[60] cursor-pointer",
              "hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>

          {!isCollapsed && (
            <div className="absolute left-4 top-6 flex items-center">
              <div className="relative w-[100px] h-[28px]">
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center gap-2 animate-pulse">
                    <div className="w-[28px] h-[28px] rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                      <div className="w-[60px] h-[8px] bg-muted rounded" />
                      <div className="w-[40px] h-[6px] bg-muted rounded" />
                    </div>
                  </div>
                )}
                <Image
                  src={theme === 'dark' ? "/Pixzel-Digital-Logo-Light-Land.png" : "/pixzel-logo.png"}
                  alt="Pixzel Digital"
                  fill
                  className={cn("object-contain transition-all duration-300", isImageLoaded ? "opacity-100" : "opacity-0")}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 min-h-0 space-y-0.5 px-2 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isMenuOpen = openMenus.includes(item.name);
            const isActive = pathname === item.href;

            return (
              <div key={item.name} className="space-y-0.5">
                {item.href && item.href !== '#' && !item.hasSub ? (
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 group text-sm relative cursor-pointer outline-none",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                      {!isCollapsed && <span className={cn("font-bold tracking-tight text-xs", isActive ? "text-white" : "text-gray-700 dark:text-gray-300")}>{item.name}</span>}
                    </div>

                    {isCollapsed && isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-secondary rounded-l-full" />
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 group text-sm relative cursor-pointer outline-none",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                      {!isCollapsed && <span className={cn("font-bold tracking-tight text-xs", isActive ? "text-white" : "text-gray-700 dark:text-gray-300")}>{item.name}</span>}
                    </div>

                    {!isCollapsed && item.hasSub && (
                      <ChevronDown className={cn("w-3 h-3 opacity-30 transition-transform duration-200", isMenuOpen && "rotate-180")} />
                    )}
                  </button>
                )}

                {!isCollapsed && item.subItems && isMenuOpen && (
                  <div className="ml-5 space-y-0.5 mt-0.5 border-l border-gray-200 dark:border-white/5 pl-3 py-0.5 animate-in slide-in-from-top-2 duration-300">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        prefetch={true}
                        className={cn(
                          "flex items-center justify-between py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 cursor-pointer hover:translate-x-0.5 transition-transform",
                          pathname === sub.href ? "text-secondary" : "text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <span>{sub.name}</span>
                        {sub.badge && (
                          <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[8px] font-bold">
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

        <div className={cn("mt-auto shrink-0 space-y-3 p-2 pt-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black", isCollapsed && "px-0 flex flex-col items-center")}>
          <div className={cn(
            "w-full flex items-center transition-all duration-300 py-1",
            isCollapsed ? "justify-center px-0" : "justify-start px-2.5"
          )}>
            <button
              onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
              className={cn(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-500 ease-in-out cursor-pointer outline-none border-2 border-transparent shadow-inner group",
                theme === 'light' ? "bg-[#FFF4CC]" : "bg-[#0F172A]"
              )}
              aria-label="Toggle Theme"
            >
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ease-in-out shadow-md transform",
                  theme === 'light' 
                    ? "translate-x-1 bg-amber-400" 
                    : "translate-x-7 bg-sky-500"
                )}
              >
                {theme === 'light' ? (
                  <Sun className="h-3.5 w-3.5 text-white fill-white" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-white fill-white" />
                )}
              </div>
            </button>
          </div>

          <div className={cn("w-full space-y-0.5", isCollapsed && "flex flex-col items-center")}>
            {bottomItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={item.isLogout ? false : true}
                onClick={async (e) => {
                  if (item.isLogout) {
                    e.preventDefault();
                    await handleLogout();
                  } else if (item.href === '#') {
                    e.preventDefault();
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 p-2.5 text-xs font-bold transition-all duration-200 rounded-lg cursor-pointer",
                  item.isLogout
                    ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 h-screen bg-white dark:bg-black border-r border-gray-100 dark:border-white/5 flex flex-col transition-transform duration-300 ease-out font-sans overflow-hidden lg:hidden",
        isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
      )}>
        <div className="relative flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={() => setIsMobileOpen?.(false)}
            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-[90px] h-[24px]">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center gap-2 animate-pulse">
                <div className="w-[24px] h-[24px] rounded-full bg-muted" />
                <div className="flex flex-col gap-1">
                  <div className="w-[50px] h-[6px] bg-muted rounded" />
                  <div className="w-[35px] h-[5px] bg-muted rounded" />
                </div>
              </div>
            )}
            <Image
              src={theme === 'dark' ? "/Pixzel-Digital-Logo-Light-Land.png" : "/pixzel-logo.png"}
              alt="Pixzel Digital"
              fill
              className={cn("object-contain transition-all duration-300", isImageLoaded ? "opacity-100" : "opacity-0")}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          <div className="w-8" />
        </div>

        <nav className="flex-1 min-h-0 space-y-0.5 px-2 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isMenuOpen = openMenus.includes(item.name);
            const isActive = pathname === item.href;

            return (
              <div key={item.name} className="space-y-0.5">
                {item.href && item.href !== '#' && !item.hasSub ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen?.(false)}
                    prefetch={true}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 group text-sm relative cursor-pointer",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                      <span className={cn("font-bold tracking-tight text-xs", isActive ? "text-white" : "text-gray-700 dark:text-gray-300")}>{item.name}</span>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 group text-sm relative cursor-pointer",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                      <span className={cn("font-bold tracking-tight text-xs", isActive ? "text-white" : "text-gray-700 dark:text-gray-300")}>{item.name}</span>
                    </div>

                    {item.hasSub && (
                      <ChevronDown className={cn("w-3 h-3 opacity-30 transition-transform duration-200", isMenuOpen && "rotate-180")} />
                    )}
                  </button>
                )}

                {item.subItems && isMenuOpen && (
                  <div className="ml-5 space-y-0.5 mt-0.5 border-l border-gray-200 dark:border-white/5 pl-3 py-0.5">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        prefetch={true}
                        onClick={() => setIsMobileOpen?.(false)}
                        className={cn(
                          "flex items-center justify-between py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer",
                          pathname === sub.href ? "text-secondary" : "text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <span>{sub.name}</span>
                        {sub.badge && (
                          <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[8px] font-bold">
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

        <div className="shrink-0 space-y-3 p-2 pt-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black">
          <div className="flex items-center justify-start w-full py-1 px-2.5">
            <button
              onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
              className={cn(
                "relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 ease-in-out cursor-pointer outline-none border-2 border-transparent shadow-inner",
                theme === 'light' ? "bg-[#FFF4CC]" : "bg-[#0F172A]"
              )}
              aria-label="Toggle Theme"
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ease-in-out shadow-md transform",
                  theme === 'light' 
                    ? "translate-x-1 bg-amber-400" 
                    : "translate-x-8 bg-sky-500"
                )}
              >
                {theme === 'light' ? (
                  <Sun className="h-4 w-4 text-white fill-white" />
                ) : (
                  <Moon className="h-4 w-4 text-white fill-white" />
                )}
              </div>
            </button>
          </div>

          <div className="space-y-0.5">
            {bottomItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={item.isLogout ? false : true}
                onClick={async (e) => {
                  if (item.isLogout) {
                    e.preventDefault();
                    await handleLogout();
                    setIsMobileOpen?.(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 p-2.5 text-xs font-bold transition-all duration-200 rounded-lg cursor-pointer",
                  item.isLogout
                    ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
