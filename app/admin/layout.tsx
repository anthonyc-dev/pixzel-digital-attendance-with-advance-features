'use client';

import Layout from '@/components/Layout';
import { PageBackground } from '@/components/PageBackground';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <PageBackground variant="subtle" />
      <div className="admin-app relative z-[5] min-w-0 w-full">{children}</div>
    </Layout>
  );
}
