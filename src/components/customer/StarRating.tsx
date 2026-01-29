'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  size?: 'sm' | 'md';
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
}: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-0.5 rounded transition-colors ${sizeClass}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= value
                ? 'fill-amber-400 text-amber-500'
                : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/** Display-only stars (e.g. for showing average) */
export function StarRatingDisplay({
  value,
  max = 5,
  size = 'sm',
}: {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = max - full - half;

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: full }, (_, i) => (
        <Star key={`f-${i}`} className={`${sizeClass} fill-current`} />
      ))}
      {half > 0 && (
        <Star className={`${sizeClass} fill-current opacity-80`} />
      )}
      {Array.from({ length: empty }, (_, i) => (
        <Star key={`e-${i}`} className={`${sizeClass} text-gray-200`} />
      ))}
    </span>
  );
}
