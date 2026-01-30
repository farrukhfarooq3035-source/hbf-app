'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Package, ChevronRight, RotateCcw, RefreshCw, Star } from 'lucide-react';
import { useCustomerOrders } from '@/hooks/use-customer-orders';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatOrderNumber } from '@/lib/order-utils';
import { StarRatingDisplay } from '@/components/customer/StarRating';
import type { Order, OrderItem } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
};

function OrderCard({
  order,
  isFavorite,
  onToggleFavorite,
  onOrderAgain,
}: {
  order: Order;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOrderAgain: (e: React.MouseEvent, order: Order) => void;
}) {
  return (
    <div className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-soft hover-lift">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/order/${order.id}`} className="flex-1 min-w-0">
          <p className="font-bold text-dark dark:text-white">
            {formatOrderNumber(order.id)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {order.created_at
              ? format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')
              : ''}
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
            Rs {order.total_price}/-
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {STATUS_LABELS[order.status] || order.status}
            </span>
            {order.rating_stars != null && (
              <StarRatingDisplay value={order.rating_stars} size="sm" />
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onToggleFavorite(); }}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 tap-highlight"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`w-5 h-5 ${
              isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400'
            }`}
          />
        </button>
        <Link href={`/order/${order.id}`} className="text-gray-400 flex-shrink-0 mt-1">
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
      {(order.order_items?.length ?? 0) > 0 && (
        <button
          type="button"
          onClick={(e) => onOrderAgain(e, order)}
          className="mt-3 w-full py-2 rounded-xl border border-primary text-primary dark:border-primary dark:text-primary font-medium flex items-center justify-center gap-2 tap-highlight hover:bg-primary/5"
        >
          <RotateCcw className="w-4 h-4" />
          Order again
        </button>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const { data: orders = [], isLoading, refetch } = useCustomerOrders(user?.id ?? null);

  const { data: favoriteOrderIds = [] } = useQuery({
    queryKey: ['favorite-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorite_orders')
        .select('order_id')
        .eq('user_id', user.id);
      if (error) return [];
      return (data ?? []).map((r) => r.order_id);
    },
    enabled: !!user?.id,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (orderId: string) => {
      if (!user?.id) return;
      const isFav = favoriteOrderIds.includes(orderId);
      if (isFav) {
        await supabase.from('favorite_orders').delete().eq('user_id', user.id).eq('order_id', orderId);
      } else {
        await supabase.from('favorite_orders').insert({ user_id: user.id, order_id: orderId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorite-orders', user?.id] }),
  });

  const favoriteOrders = orders.filter((o) => favoriteOrderIds.includes(o.id));
  const otherOrders = orders.filter((o) => !favoriteOrderIds.includes(o.id));

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=' + encodeURIComponent('/orders'));
    }
  }, [authLoading, user, router]);

  const handleOrderAgain = (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    const items = (order.order_items || []) as OrderItem[];
    items.forEach((oi) => {
      addItem({
        product_id: oi.product_id || undefined,
        deal_id: oi.deal_id || undefined,
        name: oi.item_name || 'Item',
        price: oi.price,
        qty: oi.qty,
      });
    });
    router.push('/cart');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-dark dark:text-white">My Orders</h1>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 tap-highlight disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{user?.email ?? 'My orders'}</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1">Orders will appear here after you place one.</p>
          <Link
            href="/menu"
            className="inline-block mt-4 py-2 px-4 bg-primary text-white font-medium rounded-xl hover:bg-red-700"
          >
            Order Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {favoriteOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                Favorites
              </h2>
              <div className="space-y-3">
                {favoriteOrders.map((order: Order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isFavorite
                    onToggleFavorite={() => toggleFavorite.mutate(order.id)}
                    onOrderAgain={handleOrderAgain}
                  />
                ))}
              </div>
            </div>
          )}
          <div className={favoriteOrders.length > 0 ? '' : ''}>
            {favoriteOrders.length > 0 && (
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">All orders</h2>
            )}
            <div className="space-y-3">
              {(favoriteOrders.length > 0 ? otherOrders : orders).map((order: Order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isFavorite={favoriteOrderIds.includes(order.id)}
                  onToggleFavorite={() => toggleFavorite.mutate(order.id)}
                  onOrderAgain={handleOrderAgain}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
