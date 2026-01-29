'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notification-store';

function ToastItem({ id, message }: { id: string; message: string }) {
  const removeToast = useNotificationStore((s) => s.removeToast);

  useEffect(() => {
    const t = setTimeout(() => removeToast(id), 3000);
    return () => clearTimeout(t);
  }, [id, removeToast]);

  return (
    <div
      className="animate-fade-in shadow-soft-lg rounded-xl px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100"
      role="alert"
    >
      {message}
    </div>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const toasts = useNotificationStore((s) => s.toasts);

  return (
    <>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col gap-2 max-w-md mx-auto pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} id={t.id} message={t.message} />
        ))}
      </div>
    </>
  );
}
