'use client';

import { useRef, useCallback } from 'react';

interface HorizontalScrollStripProps {
  children: React.ReactNode;
  className?: string;
}

/** Horizontal strip that scrolls with mouse wheel on desktop (vertical wheel → horizontal scroll) */
export function HorizontalScrollStrip({ children, className = '' }: HorizontalScrollStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 0;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
    const scrollingDown = e.deltaY > 0;
    const scrollingUp = e.deltaY < 0;
    if ((scrollingDown && canScrollRight) || (scrollingUp && canScrollLeft)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      onWheel={onWheel}
      className={className}
    >
      {children}
    </div>
  );
}
