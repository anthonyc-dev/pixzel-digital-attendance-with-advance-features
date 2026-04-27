'use client';

import { PageBackground } from '@/components/PageBackground';
import EmployeeSidebar from '@/components/EmployeeSidebar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-gray-50 dark:bg-black">
      <PageBackground variant="subtle" />
      <div className="relative z-[5]">
        <EmployeeSidebar />
      </div>
      <main className="relative z-[5] flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}
