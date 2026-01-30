'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  title?: string;
  onClose: () => void;
  /** Optional: prev/next for navigation */
  prev?: { imageUrl: string; alt: string } | null;
  next?: { imageUrl: string; alt: string } | null;
  onPrev?: () => void;
  onNext?: () => void;
  /** Compare mode: second image side-by-side */
  compareImageUrl?: string | null;
  compareAlt?: string;
}

const ANIMATION_MS = 300;

export function ImageModal({
  imageUrl,
  alt,
  title,
  onClose,
  prev,
  next,
  onPrev,
  onNext,
  compareImageUrl,
  compareAlt,
}: ImageModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, ANIMATION_MS);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
    handleClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || alt,
          text: title || alt,
          url: window.location.href,
        });
      } catch {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return;
    const delta = e.changedTouches[0].clientY - touchStart;
    if (delta > 80) handleClose();
    setTouchStart(null);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Backspace') handleBack();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrev, onNext]);

  const isCompare = !!compareImageUrl;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      style={{
        transition: `opacity ${ANIMATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        opacity: visible ? 1 : 0,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 tap-highlight"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-4 left-14 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 tap-highlight"
        aria-label="Back"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 tap-highlight"
        aria-label="Share"
      >
        <Share2 className="w-6 h-6" />
      </button>

      <div
        className={`relative w-full h-full flex items-center justify-center p-4 pt-16 ${
          isCompare ? 'gap-4' : ''
        }`}
      >
        <div className={`relative ${isCompare ? 'flex-1 max-w-[50%] h-full' : 'w-full max-w-2xl h-[70vh]'}`}>
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
        {isCompare && compareImageUrl && (
          <div className="flex-1 max-w-[50%] h-full relative">
            <Image
              src={compareImageUrl}
              alt={compareAlt || 'Compare'}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        )}
      </div>

      {(prev || next) && (
        <>
          {prev && onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 tap-highlight"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {next && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 tap-highlight"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
