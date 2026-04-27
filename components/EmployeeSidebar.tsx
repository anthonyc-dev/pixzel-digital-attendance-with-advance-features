'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardCheck, FilePlus, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

const navItems = [
  { name: 'Attendance', href: '/employee/attendance', icon: ClipboardCheck },
  { name: 'Leave Request', href: '/employee/leave-request', icon: FilePlus },
];

const bottomItems = [
  { name: 'Settings', href: '/employee/settings', icon: Settings },
  { name: 'Logout', href: '/auth/login', icon: LogOut, isLogout: true },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const path = pathname ?? '';
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    await fetch('/api/auth/custom-logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white font-sans dark:border-white/5 dark:bg-black">
      <div className="relative flex items-center px-4 pt-6 pb-4">
        <div className="relative h-[36px] w-[112px]">
          <Image
            src="/Pixzel-Digital-Logo-Light-Land.png"
            alt="Pixzel Digital"
            fill
            className="object-contain object-left origin-left scale-[1.14]"
          />
        </div>
      </div>

      <nav className="flex-1 min-h-0 space-y-0.5 px-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'w-full flex items-center gap-2.5 p-2.5 text-xs font-bold tracking-tight rounded-lg transition-colors duration-150',
                isActive
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-gray-100 p-2 dark:border-white/5">
        {bottomItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={async (e) => {
              if (!item.isLogout) return;
              e.preventDefault();
              await handleLogout();
            }}
            className={cn(
              'w-full flex items-center gap-2.5 p-2.5 text-xs font-bold tracking-tight rounded-lg transition-colors duration-150',
              item.isLogout
                ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
