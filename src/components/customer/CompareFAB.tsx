'use client';

import { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { useCompareStore } from '@/store/compare-store';
import { ImageModal } from '@/components/customer/ImageModal';

export function CompareFAB() {
  const { items, clear } = useCompareStore();
  const [open, setOpen] = useState(false);
  const canCompare = items.length === 2;

  if (!canCompare) return null;

  const [a, b] = items;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover tap-highlight"
      >
        <GitCompare className="w-5 h-5" />
        <span className="font-medium">Compare</span>
      </button>
      {open && a && b && (
        <ImageModal
          imageUrl={a.imageUrl}
          alt={a.title}
          title={a.title}
          compareImageUrl={b.imageUrl}
          compareAlt={b.title}
          onClose={() => {
            setOpen(false);
            clear();
          }}
        />
      )}
    </>
  );
}
