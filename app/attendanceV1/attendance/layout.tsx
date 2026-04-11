'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const subNavItems = [
  { name: 'Attendance Log', href: '/attendanceV1/attendance/attendance-log' },
  { name: 'Exceptions', href: '/attendanceV1/attendance/exceptions' },
  { name: 'Attendance Report', href: '/attendanceV1/attendance/attendance-report' },
];

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage employee attendance</p>
      </div>
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-white/5 rounded-lg w-fit">
        {subNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                isActive
                  ? "bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}