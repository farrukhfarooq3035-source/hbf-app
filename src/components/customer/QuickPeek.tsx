'use client';

import Image from 'next/image';

interface QuickPeekProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export function QuickPeek({ imageUrl, alt, onClose }: QuickPeekProps) {
  return (
    <div
      className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}
