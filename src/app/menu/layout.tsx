import { Header } from '@/components/customer/Header';

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main>{children}</main>
    </div>
  );
}
