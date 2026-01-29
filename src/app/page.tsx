import Link from 'next/link';
import { ActiveOrderCard } from '@/components/customer/ActiveOrderCard';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.png"
          alt=""
          className="h-20 w-auto object-contain max-w-[200px]"
        />
        <h1 className="text-2xl font-bold text-dark dark:text-white">HBF</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center -mt-2">Haq Bahu Foods</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <ActiveOrderCard />
        <Link
          href="/menu"
          className="w-full py-4 px-6 bg-primary text-white font-bold rounded-xl text-center hover:bg-primary-hover transition-colors shadow-soft tap-highlight"
        >
          Order Now
        </Link>
        <Link
          href="/admin"
          className="hidden md:flex w-full py-4 px-6 bg-gray-200 dark:bg-gray-700 text-dark dark:text-white font-semibold rounded-xl text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors tap-highlight"
        >
          Admin Panel
        </Link>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Near Pak Arab Society, Opp Awan Market<br />
        📞 0315 | 0333 | 0300 | 9408619
      </p>
    </div>
  );
}
