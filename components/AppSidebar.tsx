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
  FileText,
  Hourglass,
  Timer,
  CreditCard,
  Wallet,
  FilePlus,
  Settings2,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavSubItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  hasSub?: boolean;
  subItems?: NavSubItem[];
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasSub?: boolean;
  subItems?: NavSubItem[];
}

const sidebarItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/adminDashboard' },
  {
    name: 'Employers', icon: Users, href: '/admin/employer', hasSub: true, subItems: [
      { name: 'Employer', href: '/admin/employer' },
      { name: 'Register', href: '/admin/employerRegistration' },
    ]
  },
  {
    name: 'Attendance', icon: ClipboardCheck, href: '/admin/attendance/attendance-log', hasSub: true, subItems: [
      { name: 'Attendance Log', icon: FileText, href: '/admin/attendance/attendance-log' },
      { name: 'Exceptions', icon: Clock, href: '/admin/attendance/exceptions' },
      { name: 'Attendance Report', icon: FilePlus, href: '/admin/attendance/attendance-report' },
    ]
  },
  { name: 'DTR', icon: ClipboardCheck, href: '/admin/dtr' },
  // {
  //   name: 'Payroll', icon: Banknote, href: '/admin/payroll', hasSub: true, subItems: [
  //     { name: 'Payroll', href: '/admin/payroll' },
  //     { name: 'Leave Request', href: '/admin/leaves' },
  //     { name: 'Deduction', href: '/admin/deduction' },
  //     { name: 'Adjustment', href: '/admin/payrollAdjustment' },
  //     { name: 'Exception', href: '/admin/payrollException' },
  //     { name: 'Overtime', href: '/admin/overtime' },
  //   ]
  // },
  {
    name: 'Leave Management', icon: Hourglass, href: '/admin/leave-management/leave-balance', hasSub: true, subItems: [
      { name: 'Leave Balance', icon: Wallet, href: '/admin/leave-management/leave-balance' },
      { name: 'Leave Taken', icon: Clock, href: '/admin/leave-management/leave-taken' },
      { name: 'Manual Override', icon: Settings, href: '/admin/leave-management/manual-override' },
    ]
  },
  {
    name: 'Overtime Management', icon: Timer, href: '/admin/overtime-management/overtime-log', hasSub: true, subItems: [
      { name: 'Overtime Log', icon: Clock, href: '/admin/overtime-management/overtime-log' },
      { name: 'Overtime Report', icon: FilePlus, href: '/admin/overtime-management/overtime-report' },
      { name: 'Manual Override', icon: Settings, href: '/admin/overtime-management/manual-override' },
    ]
  },
  {
    name: 'Deductions', icon: CreditCard, href: '#', hasSub: true, subItems: [
      {
        name: 'Late & absent rates',
        icon: Percent,
        href: '/admin/deductions/late-absent-rates',
      },
      {
        name: 'Loans & CA', icon: Wallet, href: '#', hasSub: true, subItems: [
          { name: 'Active Loans', icon: Banknote, href: '/admin/deductions/loans-ca/active-loans' },
          { name: 'Loan History', icon: Clock, href: '/admin/deductions/loans-ca/loan-history' },
          { name: 'Payment Schedule', icon: Calendar, href: '/admin/deductions/loans-ca/payment-schedule' },
          { name: 'Add New Loan', icon: FilePlus, href: '/admin/deductions/loans-ca/add-new-loan' },
        ]
      },
      { name: 'Other Deductions', icon: CreditCard, href: '/admin/deductions/other-deductions' },
      { name: 'Deduction Report', icon: FileText, href: '/admin/deductions/deduction-report' },
    ]
  },
  {
    name: 'Payroll', icon: Banknote, href: '#', hasSub: true, subItems: [
      { name: 'Payroll Adjustments', icon: Settings, href: '/admin/payroll/payroll-adjustments' },
      { name: 'Payroll Exceptions', icon: Clock, href: '/admin/payroll/payroll-exceptions' },
      {
        name: 'Process Payroll', icon: Clock, href: '#', hasSub: true, subItems: [
          { name: 'Cutoff Date', icon: Calendar, href: '/admin/payroll/process-payroll/cutoff-date' },
          { name: 'Review Auto-Calculations', icon: FileText, href: '/admin/payroll/process-payroll/review-auto-calculations' },
          { name: 'Resolve Exceptions', icon: Settings, href: '/admin/payroll/process-payroll/resolve-exceptions' },
          { name: 'Finalize', icon: Settings2, href: '/admin/payroll/process-payroll/finalize' },
        ]
      },
      { name: 'Payroll History', icon: Clock, href: '/admin/payroll/payroll-history' },
    ]
  },
  {
    name: 'Reports', icon: FileText, href: '#', hasSub: true, subItems: [
      { name: 'Payroll Register', icon: FileText, href: '/admin/reports/payroll-register' },
      { name: 'Loan Balance Report', icon: Wallet, href: '/admin/reports/loan-balance-report' },
      { name: 'Deduction Summary', icon: CreditCard, href: '/admin/reports/deduction-summary' },
      { name: 'Employee Payslip', icon: FileText, href: '/admin/reports/employee-payslip' },
    ]
  },
  { name: 'Calendar', icon: Calendar, href: '/admin/adminCalendar' },
  { name: 'Activities', icon: Clock, href: '/admin/activities' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
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
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsImageLoaded(true);

    const root = document.documentElement;
    const syncThemeFromDom = () => {
      setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    };

    syncThemeFromDom();

    const observer = new MutationObserver(syncThemeFromDom);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'theme') return;
      const next = localStorage.getItem('theme');
      const dark = next !== 'light';
      root.classList.add('theme-switching');
      root.classList.toggle('dark', dark);
      setTheme(dark ? 'dark' : 'light');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => root.classList.remove('theme-switching'));
      });
    };
    window.addEventListener('storage', onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    root.classList.toggle('dark', newTheme === 'dark');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove('theme-switching'));
    });
  };

  const path = pathname ?? '';

  const nestedMenuKey = (parentName: string, subName: string) =>
    `${parentName}::${subName}`;

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    setOpenMenus((prev) => {
      const need = new Set(prev);
      for (const item of sidebarItems) {
        if (!item.subItems) continue;
        for (const sub of item.subItems) {
          if (sub.hasSub && sub.subItems?.length) {
            const childMatch = sub.subItems.some(
              (n) =>
                path === n.href ||
                (n.href !== '#' && path.startsWith(`${n.href}/`))
            );
            if (childMatch) {
              need.add(item.name);
              need.add(`${item.name}::${sub.name}`);
            }
          } else if (
            sub.href !== '#' &&
            (path === sub.href || path.startsWith(`${sub.href}/`))
          ) {
            need.add(item.name);
          }
        }
      }
      return [...need];
    });
  }, [path]);

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
        "hidden lg:flex h-screen bg-white dark:bg-black border-r border-gray-100 dark:border-white/5 flex-col transition-[width] duration-300 ease-out relative z-30 shrink-0 font-sans overflow-hidden",
        isCollapsed ? "w-20" : "w-52 xl:w-64"
      )}>
        <div className={cn(
          "relative flex items-center justify-end px-4 pt-6 pb-4",
          isCollapsed && "px-2 justify-center"
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
              <div className="relative h-[36px] w-[112px]">
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center gap-2 animate-pulse">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                      <div className="h-2 w-[72px] rounded bg-muted" />
                      <div className="h-1.5 w-12 rounded bg-muted" />
                    </div>
                  </div>
                )}
                <Image
                  key={theme}
                  src={theme === 'dark' ? "/Pixzel-Digital-Logo-Light-Land.png" : "/pixzel-logo.png"}
                  alt="Pixzel Digital"
                  fill
                  className={cn(
                    'object-contain object-left origin-left transition-opacity duration-200',
                    theme === 'dark' && 'scale-[1.14]',
                    isImageLoaded ? 'opacity-100' : 'opacity-0',
                  )}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 min-h-0 space-y-0.5 px-2 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isMenuOpen = openMenus.includes(item.name);
            const isActive = path === item.href;

            return (
              <div key={item.name} className="space-y-0.5">
                {item.href && item.href !== '#' && !item.hasSub ? (
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors duration-150 group text-sm relative cursor-pointer outline-none",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
                      isCollapsed ? "justify-center px-0" : "justify-between"
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
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors duration-150 group text-sm relative cursor-pointer outline-none",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
                      isCollapsed ? "justify-center px-0" : "justify-between"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                      {!isCollapsed && <span className={cn("font-bold tracking-tight text-xs", isActive ? "text-white" : "text-gray-700 dark:text-gray-300")}>{item.name}</span>}
                    </div>

                    {!isCollapsed && item.hasSub && (
                      <ChevronDown className={cn("w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform duration-200", isMenuOpen && "rotate-180")} />
                    )}
                  </button>
                )}

                {!isCollapsed && item.subItems && isMenuOpen && (
                  <div className="relative ml-10 mt-1 pl-3 py-1 animate-in slide-in-from-top-2 duration-300">
                    {item.subItems.map((sub, index) => {
                      const isNestedOpen = openMenus.includes(
                        nestedMenuKey(item.name, sub.name)
                      );
                      const isSubActive =
                        sub.href !== '#' &&
                        (path === sub.href ||
                          path.startsWith(`${sub.href}/`));
                      const nestedActive =
                        sub.hasSub &&
                        sub.subItems?.some(
                          (n) =>
                            path === n.href ||
                            (n.href !== '#' &&
                              path.startsWith(`${n.href}/`))
                        );

                      if (sub.hasSub && sub.subItems?.length) {
                        return (
                          <div key={sub.name} className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                toggleMenu(nestedMenuKey(item.name, sub.name))
                              }
                              className={cn(
                                "relative flex w-full items-center gap-2 py-1.5 text-left text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer group outline-none",
                                nestedActive
                                  ? "text-secondary"
                                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute -left-3 w-[2px] bg-gray-300 dark:bg-gray-600",
                                  index === 0 ? "-top-1" : "top-0",
                                  index === item.subItems!.length - 1 &&
                                    !isNestedOpen
                                    ? "bottom-1/2"
                                    : "bottom-0"
                                )}
                              />
                              <div className="absolute -left-3 top-1/2 h-[2px] bg-gray-300 dark:bg-gray-600 transition-all duration-150 w-3 group-hover:w-[16px]" />

                              <span
                                className={cn(
                                  "flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150 relative z-10",
                                  nestedActive
                                    ? "bg-secondary shadow-[0_0_6px_1px] shadow-secondary/60"
                                    : "border border-gray-400 dark:border-gray-500 bg-transparent"
                                )}
                              />
                              <span className="flex-1">{sub.name}</span>
                              <ChevronDown
                                className={cn(
                                  "w-3 h-3 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200",
                                  isNestedOpen && "rotate-180"
                                )}
                              />
                            </button>
                            {isNestedOpen && (
                              <div className="relative ml-4 border-l border-gray-300 dark:border-gray-600 pl-3 py-0.5">
                                {sub.subItems.map((nested) => {
                                  const isNestedLinkActive =
                                    path === nested.href ||
                                    (nested.href !== '#' &&
                                      path.startsWith(`${nested.href}/`));
                                  return (
                                    <Link
                                      key={nested.name}
                                      href={nested.href}
                                      prefetch={true}
                                      className={cn(
                                        "relative flex items-center gap-2 py-1.5 text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer group",
                                        isNestedLinkActive
                                          ? "text-secondary"
                                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150 relative z-10 group-hover:translate-x-1",
                                          isNestedLinkActive
                                            ? "bg-secondary shadow-[0_0_6px_1px] shadow-secondary/60"
                                            : "border border-gray-400 dark:border-gray-500 bg-transparent"
                                        )}
                                      />
                                      <span className="flex-1 transition-transform duration-150 group-hover:translate-x-1">
                                        {nested.name}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          prefetch={true}
                          className={cn(
                            "relative flex items-center gap-2 py-1.5 text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer group",
                            isSubActive
                              ? "text-secondary"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          {/* Vertical connection line */}
                          <div
                            className={cn(
                              "absolute -left-3 w-[2px] bg-gray-300 dark:bg-gray-600",
                              index === 0 ? "-top-1" : "top-0",
                              index === item.subItems!.length - 1
                                ? "bottom-1/2"
                                : "bottom-0"
                            )}
                          />
                          {/* Horizontal connection line that stretches on hover */}
                          <div className="absolute -left-3 top-1/2 h-[2px] bg-gray-300 dark:bg-gray-600 transition-all duration-150 w-3 group-hover:w-[16px]" />

                          <span
                            className={cn(
                              "flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150 relative z-10 group-hover:translate-x-1",
                              isSubActive
                                ? "bg-secondary shadow-[0_0_6px_1px] shadow-secondary/60"
                                : "border border-gray-400 dark:border-gray-500 bg-transparent"
                            )}
                          />
                          <span className="flex-1 transition-transform duration-150 group-hover:translate-x-1">
                            {sub.name}
                          </span>
                          {sub.badge && (
                            <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[8px] font-bold transition-transform duration-150 group-hover:translate-x-1">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className={cn("mt-auto shrink-0 space-y-3 p-2 pt-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black", isCollapsed && "px-0 flex flex-col items-center")}>
          <div className={cn(
            "w-full flex items-center py-1",
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
                  "w-full flex items-center gap-2.5 p-2.5 text-xs font-bold transition-colors duration-150 rounded-lg cursor-pointer",
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
          <div className="relative h-[32px] w-[100px]">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center gap-2 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-14 rounded bg-muted" />
                  <div className="h-1 w-10 rounded bg-muted" />
                </div>
              </div>
            )}
            <Image
              key={theme}
              src={theme === 'dark' ? "/Pixzel-Digital-Logo-Light-Land.png" : "/pixzel-logo.png"}
              alt="Pixzel Digital"
              fill
              className={cn(
                'object-contain object-left origin-left transition-opacity duration-200',
                theme === 'dark' && 'scale-[1.14]',
                isImageLoaded ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          <div className="w-8" />
        </div>

        <nav className="flex-1 min-h-0 space-y-0.5 px-2 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isMenuOpen = openMenus.includes(item.name);
            const isActive = path === item.href;

            return (
              <div key={item.name} className="space-y-0.5">
                {item.href && item.href !== '#' && !item.hasSub ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen?.(false)}
                    prefetch={true}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors duration-150 group text-sm relative cursor-pointer",
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
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors duration-150 group text-sm relative cursor-pointer",
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
                      <ChevronDown className={cn("w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform duration-200", isMenuOpen && "rotate-180")} />
                    )}
                  </button>
                )}

                {item.subItems && isMenuOpen && (
                  <div className="relative ml-10 mt-1 pl-3 py-1">
                    {item.subItems.map((sub, index) => {
                      const isNestedOpen = openMenus.includes(
                        nestedMenuKey(item.name, sub.name)
                      );
                      const isSubActive =
                        sub.href !== '#' &&
                        (path === sub.href ||
                          path.startsWith(`${sub.href}/`));
                      const nestedActive =
                        sub.hasSub &&
                        sub.subItems?.some(
                          (n) =>
                            path === n.href ||
                            (n.href !== '#' &&
                              path.startsWith(`${n.href}/`))
                        );

                      if (sub.hasSub && sub.subItems?.length) {
                        return (
                          <div key={sub.name} className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                toggleMenu(nestedMenuKey(item.name, sub.name))
                              }
                              className={cn(
                                "relative flex w-full items-center gap-2 py-1.5 text-left text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer group outline-none",
                                nestedActive
                                  ? "text-secondary"
                                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute -left-3 w-[2px] bg-gray-300 dark:bg-gray-600",
                                  index === 0 ? "-top-1" : "top-0",
                                  index === item.subItems!.length - 1 &&
                                    !isNestedOpen
                                    ? "bottom-1/2"
                                    : "bottom-0"
                                )}
                              />
                              <div className="absolute -left-3 top-1/2 h-[2px] bg-gray-300 dark:bg-gray-600 transition-all duration-150 w-3 group-hover:w-[16px]" />

                              <span
                                className={cn(
                                  "flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150 relative z-10",
                                  nestedActive
                                    ? "bg-secondary shadow-[0_0_6px_1px] shadow-secondary/60"
                                    : "border border-gray-400 dark:border-gray-500 bg-transparent"
                                )}
                              />
                              <span className="flex-1">{sub.name}</span>
                              <ChevronDown
                                className={cn(
                                  "w-3 h-3 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200",
                                  isNestedOpen && "rotate-180"
                                )}
                              />
                            </button>
                            {isNestedOpen && (
                              <div className="relative ml-4 border-l border-gray-300 dark:border-gray-600 pl-3 py-0.5">
                                {sub.subItems.map((nested) => {
                                  const isNestedLinkActive =
                                    path === nested.href ||
                                    (nested.href !== '#' &&
                                      path.startsWith(`${nested.href}/`));
                                  return (
                                    <Link
                                      key={nested.name}
                                      href={nested.href}
                                      prefetch={true}
                                      onClick={() => setIsMobileOpen?.(false)}
                                      className={cn(
                                        "relative flex items-center gap-2 py-1.5 text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer group",
                                        isNestedLinkActive
                                          ? "text-secondary"
                                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150 relative z-10 group-hover:translate-x-1",
                                          isNestedLinkActive
                                            ? "bg-secondary shadow-[0_0_6px_1px] shadow-secondary/60"
                                            : "border border-gray-400 dark:border-gray-500 bg-transparent"
                                        )}
                                      />
                                      <span className="flex-1 transition-transform duration-150 group-hover:translate-x-1">
                                        {nested.name}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          prefetch={true}
                          onClick={() => setIsMobileOpen?.(false)}
                          className={cn(
                            "relative flex items-center gap-2 py-1.5 text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer group",
                            isSubActive
                              ? "text-secondary"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          {/* Vertical connection line */}
                          <div
                            className={cn(
                              "absolute -left-3 w-[2px] bg-gray-300 dark:bg-gray-600",
                              index === 0 ? "-top-1" : "top-0",
                              index === item.subItems!.length - 1
                                ? "bottom-1/2"
                                : "bottom-0"
                            )}
                          />
                          {/* Horizontal connection line that stretches on hover */}
                          <div className="absolute -left-3 top-1/2 h-[2px] bg-gray-300 dark:bg-gray-600 transition-all duration-150 w-3 group-hover:w-[16px]" />

                          <span
                            className={cn(
                              "flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150 relative z-10 group-hover:translate-x-1",
                              isSubActive
                                ? "bg-secondary shadow-[0_0_6px_1px] shadow-secondary/60"
                                : "border border-gray-400 dark:border-gray-500 bg-transparent"
                            )}
                          />
                          <span className="flex-1 transition-transform duration-150 group-hover:translate-x-1">
                            {sub.name}
                          </span>
                          {sub.badge && (
                            <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[8px] font-bold transition-transform duration-150 group-hover:translate-x-1">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
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
                  "w-full flex items-center gap-2.5 p-2.5 text-xs font-bold transition-colors duration-150 rounded-lg cursor-pointer",
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
