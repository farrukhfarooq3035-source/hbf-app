'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { X, Package, Star, LogOut } from 'lucide-react';
import { useCustomerStore } from '@/store/customer-store';
import { useCustomerOrders } from '@/hooks/use-customer-orders';
import { supabase } from '@/lib/supabase';
import { formatOrderNumber } from '@/lib/order-utils';
import { StarRatingDisplay } from '@/components/customer/StarRating';
import type { Order } from '@/types';
import type { User } from '@supabase/supabase-js';

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
};

export function ProfilePanel({
  onClose,
  user = null,
  onSignOut,
}: {
  onClose: () => void;
  user?: User | null;
  onSignOut?: () => Promise<void>;
}) {
  const { clearCustomer } = useCustomerStore();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useCustomerOrders(user?.id ?? null);

  const totalOrders = orders.length;
  const currentOrderFromList = orders.find((o) => o.status !== 'delivered') ?? null;
  const displayName = orders.length > 0 ? orders[0].customer_name : (user?.email ?? 'Customer');
  const displayPhone = orders.length > 0 ? orders[0].phone : null;

  useEffect(() => {
    if (!currentOrderFromList?.id) {
      setCurrentOrder(null);
      return;
    }
    setCurrentOrder(currentOrderFromList);

    const channel = supabase
      .channel(`order-${currentOrderFromList.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrderFromList.id}`,
        },
        (payload) => setCurrentOrder(payload.new as Order)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrderFromList?.id]);

  const handleLogout = () => {
    clearCustomer();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {!user ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sign in to view your orders and profile.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {user?.email && (
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                  <p className="font-medium text-dark dark:text-white truncate">{user.email}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-dark dark:text-white">{displayName}</p>
                  {displayPhone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{displayPhone}</p>
                  )}
                </div>
                {totalOrders >= 3 && (
                  <span className="flex items-center gap-1 text-amber-500" title="Regular customer (3+ orders)">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Total Orders</span>
                </div>
                <p className="text-2xl font-bold text-primary">{totalOrders}</p>
              </div>

              {currentOrder && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Current Order</p>
                  <p className="font-bold text-dark">
                    {formatOrderNumber(currentOrder.id)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentOrder.created_at
                      ? format(new Date(currentOrder.created_at), 'MMM d, yyyy · h:mm a')
                      : ''}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Rs {currentOrder.total_price}/-
                  </p>
                  <p className="mt-2 inline-block px-3 py-1 rounded-lg bg-primary text-white text-sm font-medium">
                    {STATUS_LABELS[currentOrder.status] || currentOrder.status}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Status updates in real time when admin changes it.
                  </p>
                </div>
              )}

              {!currentOrder && totalOrders > 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No active order. Your last order was delivered.
                </p>
              )}

              {totalOrders > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Previous orders</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {orders
                      .filter((o) => o.status === 'delivered')
                      .slice(0, 5)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="flex flex-col gap-1 bg-gray-50 rounded-xl p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {formatOrderNumber(o.id)} • Rs {o.total_price}/-
                            </span>
                            {o.rating_stars != null ? (
                              <StarRatingDisplay value={o.rating_stars} size="sm" />
                            ) : (
                              <Link
                                href={`/order/${o.id}`}
                                onClick={onClose}
                                className="text-primary font-medium"
                              >
                                Rate
                              </Link>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {o.created_at
                              ? format(new Date(o.created_at), 'MMM d, yyyy · h:mm a')
                              : ''}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {!currentOrder && totalOrders === 0 && !isLoading && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No orders yet.
                </p>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl"
              >
                Close
              </button>
              {user && onSignOut && (
                <button
                  onClick={async () => {
                    await onSignOut();
                    clearCustomer();
                    onClose();
                  }}
                  className="w-full py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
