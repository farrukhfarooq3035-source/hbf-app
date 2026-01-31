'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

const BLUR_DATA =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=';

interface FoodImageProps {
  src: string | null;
  alt: string;
  /** 1:1 for cards, 4/3 for horizontal deal strip */
  aspect?: '1:1' | '4:3';
  sizes?: string;
  /** Double-tap on image adds to wishlist */
  onDoubleTap?: () => void;
  /** Long-press opens quick peek */
  onLongPress?: () => void;
  /** Click opens full-screen modal */
  onClick?: () => void;
  className?: string;
}

export function FoodImage({
  src,
  alt,
  aspect = '1:1',
  sizes = '(max-width: 768px) 50vw, 25vw',
  onDoubleTap,
  onLongPress,
  onClick,
  className = '',
}: FoodImageProps) {
  const [loaded, setLoaded] = useState(false);
  const lastTap = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDoubleTap = useCallback(() => {
    if (Date.now() - lastTap.current < 350) {
      onDoubleTap?.();
      lastTap.current = 0;
    } else {
      lastTap.current = Date.now();
    }
  }, [onDoubleTap]);

  const startY = useRef(0);
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      onLongPress?.();
    }, 400);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (longPressTimer.current && Math.abs(e.clientY - startY.current) > 8) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const aspectClass = aspect === '1:1' ? 'aspect-square' : 'aspect-[4/3]';

  if (!src) {
    return (
      <div
        className={`${aspectClass} bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 ${className}`}
      >
        <span className="text-4xl">🍔</span>
      </div>
    );
  }

  return (
    <div
      data-food-image
      className={`${aspectClass} bg-gray-100 dark:bg-gray-700 relative overflow-hidden touch-manipulation ${className}`}
      onClick={() => onClick?.()}
      onDoubleClick={(e) => {
        e.preventDefault();
        handleDoubleTap();
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Placeholder skeleton */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-600"
          aria-hidden
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover transition-opacity duration-200 pointer-events-none ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        unoptimized
      />
    </div>
  );
}
