'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/** Unregister service workers + cache-busting redirect to avoid stale content after login */
async function clearStaleCacheAndRedirect(next: string) {
  if (typeof window === 'undefined') return;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* ignore */
  }
  const sep = next.includes('?') ? '&' : '?';
  const url = `${next}${sep}_=${Date.now()}`;
  window.location.replace(url);
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code');
      const hashParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.hash.slice(1)) : null;
      const accessToken = hashParams?.get('access_token');
      const refreshToken = hashParams?.get('refresh_token');
      const next = searchParams.get('next') ?? '/menu';

      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setError(err.message);
          return;
        }
        await clearStaleCacheAndRedirect(next);
        return;
      }
      if (accessToken && refreshToken) {
        const { error: err } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (err) {
          setError(err.message);
          return;
        }
        await clearStaleCacheAndRedirect(next);
        return;
      }
      setError('Invalid link or expired. Try signing in again.');
    };
    run();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
        <a href="/login" className="text-primary font-medium hover:underline">Sign in again</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">Signing you in...</p>
    </div>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
