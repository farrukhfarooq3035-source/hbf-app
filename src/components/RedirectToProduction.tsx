'use client';

import { useEffect } from 'react';

/** Production URL - set NEXT_PUBLIC_APP_URL in Vercel. Working: hbf-app-kappa.vercel.app */
const PRODUCTION_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL || 'https://hbf-app-kappa.vercel.app';

/** Redirect from 86ed0370 / e4480561 to production (kappa) */
export function RedirectToProduction() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    if (host.includes('farrukhs-projects-86ed0370') || host.includes('farrukhs-projects-e4480561')) {
      const target = `${PRODUCTION_ORIGIN.replace(/\/$/, '')}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(target);
    }
  }, []);
  return null;
}
