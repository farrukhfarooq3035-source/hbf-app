'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Minimal post-auth redirect page.
 * Clears SW/cache and does hard redirect to avoid stale content after login.
 * Separate from callback so this page is never cached.
 */
export default function AuthContinuePage() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/menu';

  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return;
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
      } catch {
        /* ignore */
      }
      const sep = next.includes('?') ? '&' : '?';
      window.location.replace(`${next}${sep}_=${Date.now()}`);
    };
    run();
  }, [next]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">Redirecting...</p>
    </div>
  );
}
