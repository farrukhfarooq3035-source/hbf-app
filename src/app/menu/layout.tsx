import { Header } from '@/components/customer/Header';

export const dynamic = 'force-dynamic';
import { Footer } from '@/components/customer/Footer';
import { CompareFAB } from '@/components/customer/CompareFAB';

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-40 flex flex-col w-full max-w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 min-h-0 flex flex-col w-full min-w-0">{children}</main>
      <Footer />
      <CompareFAB />
    </div>
  );
}
