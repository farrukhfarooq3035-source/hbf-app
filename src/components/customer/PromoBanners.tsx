'use client';

import { useBusinessHours } from '@/hooks/use-business-hours';
import Link from 'next/link';

export function PromoBanners() {
  const { promoBanners } = useBusinessHours();
  if (!promoBanners?.length) return null;
  return (
    <div className="space-y-2">
      {promoBanners.map((b, i) => (
        <Link
          key={i}
          href="/menu"
          className="block p-4 rounded-xl bg-gradient-to-r from-primary/10 to-amber-500/10 dark:from-primary/20 dark:to-amber-500/20 border border-primary/20 dark:border-primary/30"
        >
          <div className="flex items-center gap-3">
            {b.image_url && (
              <img src={b.image_url} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-dark dark:text-white truncate">{b.title}</p>
              <p className="text-sm font-semibold text-primary">{b.discount}% off</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
