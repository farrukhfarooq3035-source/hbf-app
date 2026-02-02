'use client';

import Link from 'next/link';
import { ActiveOrderCard } from '@/components/customer/ActiveOrderCard';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { useCartStore } from '@/store/cart-store';
import { Truck, Store, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function HomePage() {
  const { isOpen, openTime, closeTime, isHappyHour, happyHourStart, happyHourEnd, happyHourDiscount } = useBusinessHours();
  const { deliveryMode, setDeliveryMode } = useCartStore();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-8 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src="/logo.png" alt="" className="h-20 w-auto object-contain max-w-[200px]" />
          <h1 className="text-2xl font-bold text-dark dark:text-white">HBF</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center -mt-1">Haq Bahu Foods</p>
        </div>

        {/* We're Open / Closed Banner */}
        <div
          className={`w-full flex items-center gap-3 p-4 rounded-2xl mb-6 ${
            isOpen
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {isOpen ? (
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-lg ${isOpen ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {isOpen ? "We're Open" : "We're Closed"}
            </p>
            <p className={`text-sm ${isOpen ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {isOpen
                ? `Open ${openTime} – ${closeTime}. Order now!`
                : `Open ${openTime} – ${closeTime}. You can browse the menu; orders can be placed when we're open.`}
            </p>
            {isHappyHour && (
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mt-1">
                🎉 Happy Hour {happyHourStart}–{happyHourEnd}: {happyHourDiscount}% off!
              </p>
            )}
          </div>
        </div>

        {/* Delivery / Pickup Hero */}
        <div className="w-full rounded-2xl overflow-hidden shadow-soft border border-gray-200 dark:border-gray-700 mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/20 dark:from-primary/20 dark:to-accent/30 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">How would you like your order?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeliveryMode('delivery')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold transition-all tap-highlight ${
                  deliveryMode === 'delivery'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <Truck className="w-6 h-6" />
                Delivery
              </button>
              <button
                onClick={() => setDeliveryMode('pickup')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold transition-all tap-highlight ${
                  deliveryMode === 'pickup'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <Store className="w-6 h-6" />
                Pickup
              </button>
            </div>
          </div>
        </div>

        <ActiveOrderCard />

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Link
            href="/menu"
            className="w-full py-4 px-6 bg-primary text-white font-bold rounded-xl text-center hover:bg-primary-hover transition-colors shadow-soft tap-highlight"
          >
            Order Now
          </Link>

          <Link
            href="/admin"
            className="hidden md:flex w-full py-3 px-6 bg-gray-200 dark:bg-gray-700 text-dark dark:text-white font-semibold rounded-xl text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors tap-highlight"
          >
            Admin Panel
          </Link>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
          Near Pak Arab Society, Opp Awan Market
          <br />
          <span className="flex items-center justify-center gap-1 mt-1">
            <Clock className="w-4 h-4" />
            📞 0315 | 0333 | 0300 | 9408619
          </span>
        </p>
      </div>
    </div>
  );
}
