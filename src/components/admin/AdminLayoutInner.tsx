'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { NewOrderAlert } from '@/components/admin/NewOrderAlert';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';

export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <NewOrderAlert />
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white dark:bg-white text-gray-900">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
