import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/customer/Footer';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3">
        <Link href="/cart" className="flex items-center gap-2 text-dark">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Cart</span>
        </Link>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}