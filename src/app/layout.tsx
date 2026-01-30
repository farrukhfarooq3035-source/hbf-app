import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CartBar } from '@/components/customer/CartBar';
import { LiveOrderButton } from '@/components/customer/LiveOrderButton';
import { LocationPermission } from '@/components/customer/LocationPermission';

export const metadata: Metadata = {
  title: 'HBF - Haq Bahu Foods | Order Online',
  description: 'Order delicious food from Haq Bahu Foods. Burgers, Pizza, Shawarma & more.',
  manifest: '/manifest.json',
  icons: { icon: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#E50914',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
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
