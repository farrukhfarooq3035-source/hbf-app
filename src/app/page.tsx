'use client';

import Link from 'next/link';
import { ActiveOrderCard } from '@/components/customer/ActiveOrderCard';
import { ShareOnWhatsApp } from '@/components/customer/ShareOnWhatsApp';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { useCartStore } from '@/store/cart-store';
import { Truck, Store, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getWhatsAppOrderLink } from '@/lib/store-config';

export default function HomePage() {
  const { isOpen, openTime, closeTime, isHappyHour, happyHourStart, happyHourEnd, happyHourDiscount } = useBusinessHours();
  const { deliveryMode, setDeliveryMode } = useCartStore();
  const waOrderLink = getWhatsAppOrderLink();

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

          {waOrderLink && (
            <a
              href={waOrderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-[#25D366] text-white font-bold rounded-xl text-center hover:bg-[#20bd5a] transition-colors shadow-soft tap-highlight flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order via WhatsApp
            </a>
          )}

          <ShareOnWhatsApp className="w-full justify-center" label="Share Menu" />

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
