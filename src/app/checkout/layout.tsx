import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3">
        <Link href="/cart" className="flex items-center gap-2 text-dark">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Cart</span>
        </Link>
      </header>
      {children}
    </div>
  );
}