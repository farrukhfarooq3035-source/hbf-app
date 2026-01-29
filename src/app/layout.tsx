import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CartBar } from '@/components/customer/CartBar';
import { LiveOrderButton } from '@/components/customer/LiveOrderButton';
import { LocationPermission } from '@/components/customer/LocationPermission';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'HBF - Haq Bahu Foods | Order Online',
  description: 'Order delicious food from Haq Bahu Foods. Burgers, Pizza, Shawarma & more.',
  manifest: '/manifest.json',
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
    <html lang="en" className={inter.variable}>
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
