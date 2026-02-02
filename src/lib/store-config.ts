/** Store contact phone for "Call store" etc. Set NEXT_PUBLIC_STORE_PHONE in .env */
export function getStorePhone(): string | null {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_STORE_PHONE || null;
  }
  return process.env.NEXT_PUBLIC_STORE_PHONE || null;
}

/** Default display if no env set (e.g. for Settings page) */
export const DEFAULT_STORE_PHONE_DISPLAY = '0315 | 0333 | 0300 | 9408619';

/** WhatsApp order link: wa.me/PHONE?text=MENU_LINK. Set NEXT_PUBLIC_WHATSAPP_ORDER_LINK in .env */
export function getWhatsAppOrderLink(): string | null {
  return process.env.NEXT_PUBLIC_WHATSAPP_ORDER_LINK || null;
}

/** App URL for sharing. Set NEXT_PUBLIC_APP_URL in .env */
export function getAppUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || 'https://hbf.vercel.app';
}
