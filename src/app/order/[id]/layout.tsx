import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3">
        <Link href="/menu" className="flex items-center gap-2 text-dark">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Order Tracking</span>
        </Link>
      </header>
      {children}
    </div>
  );
}
