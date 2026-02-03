import type { Metadata, Viewport } from 'next';
import { Outfit, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CartBar } from '@/components/customer/CartBar';
import { LiveOrderButton } from '@/components/customer/LiveOrderButton';
import { LocationPermission } from '@/components/customer/LocationPermission';
import { RedirectToProduction } from '@/components/RedirectToProduction';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HBF - Haq Bahu Foods | Order Online',
  description: 'Order delicious food from Haq Bahu Foods. Burgers, Pizza, Shawarma & more.',
  manifest: '/manifest.json',
  icons: { icon: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#E50914',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`font-sans ${outfit.variable} ${sora.variable}`} data-build={BUILD_ID}>
      <body className="min-h-screen antialiased font-sans" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <RedirectToProduction />
        <Providers>
          <LocationPermission />
          {children}
          <LiveOrderButton />
          <CartBar />
        </Providers>
      </body>
    </html>
  );
}
