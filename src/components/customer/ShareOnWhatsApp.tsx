'use client';

import { Share2 } from 'lucide-react';
import { getAppUrl, getWhatsAppOrderLink } from '@/lib/store-config';

interface ShareOnWhatsAppProps {
  /** Custom text for share (default: menu link + message) */
  shareText?: string;
  className?: string;
  label?: string;
}

export function ShareOnWhatsApp({ shareText, className = '', label = 'Share on WhatsApp' }: ShareOnWhatsAppProps) {
  const waLink = getWhatsAppOrderLink();
  const appUrl = getAppUrl();
  const defaultText = `Check out HBF menu & order online: ${appUrl}/menu`;
  const text = encodeURIComponent(shareText || defaultText);

  if (!waLink) {
    return null;
  }

  const href = waLink.includes('?') ? `${waLink}&text=${text}` : `${waLink}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#20bd5a] transition-colors tap-highlight ${className}`}
      aria-label={label}
    >
      <Share2 className="w-5 h-5" />
      {label}
    </a>
  );
}
