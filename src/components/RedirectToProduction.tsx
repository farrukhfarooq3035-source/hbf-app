'use client';

import { useEffect } from 'react';

/** Production URL (e4480561 team) - set NEXT_PUBLIC_APP_URL in Vercel if different */
const PRODUCTION_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL || 'https://hbf-farrukhs-projects-e4480561.vercel.app';

/** Redirect from old deployment (86ed0370) to production (e4480561) */
export function RedirectToProduction() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    if (host.includes('farrukhs-projects-86ed0370')) {
      const target = `${PRODUCTION_ORIGIN.replace(/\/$/, '')}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(target);
    }
  }, []);
  return null;
}
