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

/** Production app URL - use for QR codes, redirects. Set NEXT_PUBLIC_APP_URL in Vercel. */
export const PRODUCTION_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://hbf-app-kappa.vercel.app';

/** App URL for sharing. Uses production URL when set, else current origin. */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return PRODUCTION_APP_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return PRODUCTION_APP_URL;
}
