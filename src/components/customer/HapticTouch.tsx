'use client';

import { useEffect } from 'react';

/** Adds haptic feedback on touch for interactive elements in main app */
export function HapticTouch() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a[href], [role="button"], [data-haptic]');
      if (interactive) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    };
    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);
  return null;
}
