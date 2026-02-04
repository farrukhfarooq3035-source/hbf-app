'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{item.name}</h3>
          {item.size && <p className="text-sm text-gray-500 dark:text-gray-400">{item.size}</p>}
          {currentAddons.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">+ {currentAddons.join(', ')}</p>
          )}
          <p className="text-primary font-bold">Rs {item.price}/-</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => updateQty(idx, item.qty - 1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold w-6 text-center">{item.qty}</span>
          <button
            onClick={() => updateQty(idx, item.qty + 1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeItem(idx)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
    <div className="min-h-screen max-w-2xl mx-auto pb-32">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <CartItemRow key={idx} item={item} idx={idx} updateQty={updateQty} removeItem={removeItem} />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 shadow-soft-lg safe-area-bottom" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="space-y-1 mb-4">
          {deliveryMode === 'delivery' && (
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                Free within 5 km • Rs 30 per km beyond 5 km
              </p>
              {distanceKm != null && (
                <button
                  type="button"
                  onClick={refreshLocation}
                  disabled={refreshingLocation}
                  className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingLocation ? 'animate-spin' : ''}`} />
                  {refreshingLocation ? 'Updating...' : 'Wrong distance? Refresh location'}
                </button>
              )}
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>Rs {getSubtotal()}/-</span>
          </div>
          {deliveryMode === 'delivery' && getDeliveryFee() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Delivery (beyond 5 km)</span>
              <span>Rs {getDeliveryFee()}/-</span>
            </div>
          )}
          {estMins != null && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estimated {deliveryMode === 'delivery' ? 'delivery' : 'pickup'}: ~{estMins} min
            </p>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">
              Rs {getGrandTotal()}/-
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary-deep text-white font-bold rounded-xl hover:opacity-95 shadow-lg transition-all duration-280 active:scale-[0.98]"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
