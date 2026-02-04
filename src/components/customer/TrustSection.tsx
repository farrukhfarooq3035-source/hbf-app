'use client';

import { Star, Users, Clock, Shield, Leaf } from 'lucide-react';

const STATS = [
  { icon: Star, label: '4.8', sub: 'Rating', fill: true },
  { icon: Users, label: '50K+', sub: 'Orders Served' },
  { icon: Clock, label: '~35 min', sub: 'Avg. Delivery' },
  { icon: Shield, label: 'Safe', sub: 'Hygienic' },
  { icon: Leaf, label: 'Fresh', sub: 'Daily Prep' },
];

export function TrustSection() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 shadow-premium overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {STATS.map(({ icon: Icon, label, sub, fill }) => (
            <div
              key={sub}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div className="flex items-center gap-1">
                {fill ? (
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                ) : (
                  <Icon className="w-5 h-5 text-primary dark:text-primary/90" />
                )}
                <span className="font-bold text-charcoal dark:text-white text-sm sm:text-base">
                  {label}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                {sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
