import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
