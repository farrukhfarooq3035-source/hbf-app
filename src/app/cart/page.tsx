'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, Trash2, RefreshCw } from 'lucide-react';
import { RippleButton } from '@/components/customer/RippleButton';
import { useCartStore } from '@/store/cart-store';
import { useBusinessHours } from '@/hooks/use-business-hours';
import type { CartItem } from '@/types';

function CartItemRow({
  item,
  idx,
  updateQty,
  removeItem,
}: {
  item: CartItem;
  idx: number;
  updateQty: (index: number, qty: number) => void;
  removeItem: (index: number) => void;
}) {
  const currentAddons = item.addons ?? [];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm p-4 flex gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
        {item.size && <p className="text-sm text-gray-500 dark:text-gray-400">{item.size}</p>}
        {currentAddons.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">+ {currentAddons.join(', ')}</p>
        )}
        <p className="text-primary font-bold mt-1">Rs {item.price}/-</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => updateQty(idx, item.qty - 1)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold w-6 text-center text-sm">{item.qty}</span>
        <button
          onClick={() => updateQty(idx, item.qty + 1)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => removeItem(idx)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, getSubtotal, getDeliveryFee, getGrandTotal, getDistanceKm, getEstimatedDeliveryMinutes, deliveryMode, setUserLocation } = useCartStore();
  const { jazzcashTillId } = useBusinessHours();
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const estMins = getEstimatedDeliveryMinutes();
  const distanceKm = getDistanceKm();
  const refreshLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
    setRefreshingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
        setRefreshingLocation(false);
      },
      () => setRefreshingLocation(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-600 text-lg">Your cart is empty</p>
        <Link
          href="/menu"
          className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-xl"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Cart</h1>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <CartItemRow key={idx} item={item} idx={idx} updateQty={updateQty} removeItem={removeItem} />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 p-4 pt-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="space-y-1.5 mb-3">
          {deliveryMode === 'delivery' && (
            <div className="flex items-start gap-2">
              <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex-1">
                Min Rs 500 • Free within 5 km • Rs 30/km beyond
              </p>
              {distanceKm != null && (
                <button
                  type="button"
                  onClick={refreshLocation}
                  disabled={refreshingLocation}
                  className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshingLocation ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium">Rs {getSubtotal()}/-</span>
          </div>
          {deliveryMode === 'delivery' && getDeliveryFee() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Delivery</span>
              <span className="font-medium">Rs {getDeliveryFee()}/-</span>
            </div>
          )}
          {estMins != null && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ~{estMins} min {deliveryMode === 'delivery' ? 'delivery' : 'pickup'}
            </p>
          )}
          {jazzcashTillId && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              JazzCash at checkout • TILL: {jazzcashTillId}
            </p>
          )}
          {deliveryMode === 'delivery' && getSubtotal() < 500 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Add Rs {500 - getSubtotal()}/- more for delivery
            </p>
          )}
          <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200 dark:border-gray-600">
            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-primary">
              Rs {getGrandTotal()}/-
            </span>
          </div>
        </div>
        <RippleButton
          onClick={() => router.push('/checkout')}
          disabled={deliveryMode === 'delivery' && getSubtotal() < 500}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-deep text-white font-bold rounded-xl hover:opacity-95 shadow-lg transition-all duration-280 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deliveryMode === 'delivery' && getSubtotal() < 500
            ? `Add Rs ${500 - getSubtotal()}/- more for delivery`
            : 'Place Order'}
        </RippleButton>
      </div>
    </div>
  );
}
