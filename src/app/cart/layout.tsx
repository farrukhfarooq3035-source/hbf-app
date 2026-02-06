import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <Link href="/menu" className="flex items-center gap-2 text-dark dark:text-white font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </Link>
      </header>
      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
    </div>
  );
}
