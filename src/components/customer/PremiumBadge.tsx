'use client';

import type { BadgeType } from '@/lib/product-badges';

const BADGE_STYLES: Record<
  BadgeType,
  { className: string; label: string }
> = {
  'chefs-pick': {
    className:
      'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm',
    label: "Chef's Pick",
  },
  'most-loved': {
    className:
      'bg-gradient-to-r from-primary to-primary-deep text-white shadow-sm',
    label: 'Most Loved',
  },
  signature: {
    className:
      'bg-gradient-to-r from-charcoal to-charcoal-muted text-white shadow-sm',
    label: 'HBF Signature',
  },
};

interface PremiumBadgeProps {
  type: BadgeType;
  className?: string;
}

export function PremiumBadge({ type, className = '' }: PremiumBadgeProps) {
  const style = BADGE_STYLES[type];
  if (!style) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase ${style.className} ${className}`}
    >
      {style.label}
    </span>
  );
}
