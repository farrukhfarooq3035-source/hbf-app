'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Check, Package, Truck, Phone, Share2, RefreshCw, RotateCcw, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cart-store';
import { formatOrderNumber } from '@/lib/order-utils';
import { useNotificationStore } from '@/store/notification-store';
import { getStorePhone } from '@/lib/store-config';
import { useAuth } from '@/hooks/use-auth';
import { StarRating, StarRatingDisplay } from '@/components/customer/StarRating';
import { RiderMap } from '@/components/RiderMap';
import { STORE_LAT, STORE_LNG } from '@/lib/geo';
import type { Order, OrderStatus, OrderItem } from '@/types';
import { OrderChatPanel } from '@/components/customer/OrderChatPanel';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
};

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'on_the_way', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const addToast = useNotificationStore((s) => s.addToast);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=' + encodeURIComponent('/order/' + id));
    }
  }, [authLoading, user, router, id]);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingDelivery, setRatingDelivery] = useState(0);
  const [ratingQuality, setRatingQuality] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [riderInfo, setRiderInfo] = useState<{ name: string | null; phone: string | null }>({ name: null, phone: null });
  const [refreshingRider, setRefreshingRider] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const storePhone = getStorePhone();
  const addItem = useCartStore((s) => s.addItem);
  const routerForCart = useRouter();

  const fetchRiderLocation = useCallback(() => {
    if (order?.status !== 'on_the_way') return;
    setRefreshingRider(true);
    fetch(`/api/orders/${id}/rider-location`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lat != null && data?.lng != null) {
          setRiderLocation({ lat: data.lat, lng: data.lng });
        } else {
          setRiderLocation(null);
        }
        setRiderInfo({
          name: data?.rider_name ?? null,
          phone: data?.rider_phone ?? null,
        });
      })
      .catch(() => {})
      .finally(() => setRefreshingRider(false));
  }, [id, order?.status]);

  useEffect(() => {
    if (!user) return;
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      setLoading(false);
      if (error) return;
      const ord = data as Order;
      if (ord.user_id != null && ord.user_id !== user.id) {
        router.replace('/orders');
        return;
      }
      setOrder(ord);
    };

    fetchOrder();

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrder(newOrder);
          addToast(`${formatOrderNumber(id)} is now ${STATUS_LABELS[newOrder.status] || newOrder.status}`);
          if (newOrder.status === 'delivered' && newOrder.rating_stars == null) {
            setShowRatingPopup(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id, router]);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'delivered' && order.rating_stars == null) {
      setShowRatingPopup(true);
    }
  }, [order?.status, order?.rating_stars]);

  useEffect(() => {
    if (!order || order.status !== 'on_the_way') {
      setRiderLocation(null);
      setRiderInfo({ name: null, phone: null });
      return;
    }
    fetchRiderLocation();
    const interval = setInterval(fetchRiderLocation, 10000);
    return () => clearInterval(interval);
  }, [order?.id, order?.status, id, fetchRiderLocation]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-600">Order not found</p>
        <Link href="/menu" className="mt-4 text-primary font-semibold">
          Back to Menu
        </Link>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  const isDeliveredUnrated = order.status === 'delivered' && order.rating_stars == null;
  const ratingForm = (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Overall *</p>
        <StarRating value={ratingStars} onChange={setRatingStars} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Delivery</p>
        <StarRating value={ratingDelivery} onChange={setRatingDelivery} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Quality</p>
        <StarRating value={ratingQuality} onChange={setRatingQuality} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Comment (optional)
        </label>
        <textarea
          value={ratingComment}
          onChange={(e) => setRatingComment(e.target.value)}
          placeholder="Any feedback?"
          rows={2}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowRatingPopup(false)}
          className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
        >
          Later
        </button>
        <button
          onClick={async () => {
            if (ratingStars < 1) return;
            setRatingSubmitting(true);
            try {
              const res = await fetch(`/api/orders/${id}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone: order.phone,
                  stars: ratingStars,
                  delivery: ratingDelivery || undefined,
                  quality: ratingQuality || undefined,
                  comment: ratingComment || undefined,
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                const msg = data.error || res.statusText || 'Failed to submit';
                const hint = data.hint ? `\n\n${data.hint}` : '';
                throw new Error(msg + hint);
              }
              setOrder((o) =>
                o
                  ? {
                      ...o,
                      rating_stars: ratingStars,
                      rating_delivery: ratingDelivery || null,
                      rating_quality: ratingQuality || null,
                      rating_comment: ratingComment || null,
                      rated_at: new Date().toISOString(),
                    }
                  : o
              );
              setShowRatingPopup(false);
            } catch (e) {
              alert(e instanceof Error ? e.message : 'Failed to submit');
            } finally {
              setRatingSubmitting(false);
            }
          }}
          disabled={ratingStars < 1 || ratingSubmitting}
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50"
        >
          {ratingSubmitting ? 'Submitting...' : 'Submit rating'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6">
      {showRatingPopup && isDeliveredUnrated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg text-dark mb-2">Rate your order</h3>
            <p className="text-sm text-gray-600 mb-4">
              How was your experience? (Delivery & quality)
            </p>
            {ratingForm}
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{formatOrderNumber(order.id)}</h1>
        <p className="text-gray-600 mt-1">
          Status: {order.status}
          {order.rating_stars != null && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              Rated
            </span>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {order.created_at
            ? format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')
            : ''}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-2">
          <p>
            <span className="font-medium">Total:</span> Rs {order.total_price}/-
          </p>
          <p>
            <span className="font-medium">Address:</span> {order.address}
          </p>
          {order.notes && (
            <p>
              <span className="font-medium">Order notes:</span> {order.notes}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {(order.order_items?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => {
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
                routerForCart.push('/cart');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium tap-highlight hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4" />
              Reorder
            </button>
          )}
          {storePhone && (
            <a
              href={`tel:${storePhone.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium tap-highlight hover:bg-primary/20"
            >
              <Phone className="w-4 h-4" />
              Call store
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined' ? `${window.location.origin}/order/${id}` : '';
              if (navigator.share) {
                navigator.share({
                  title: `Order ${formatOrderNumber(order.id)}`,
                  text: `Track your HBF order: ${formatOrderNumber(order.id)}`,
                  url,
                }).catch(() => {
                  navigator.clipboard?.writeText(url);
                  addToast('Link copied');
                });
              } else {
                navigator.clipboard?.writeText(url);
                addToast('Link copied');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 font-medium tap-highlight hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4" />
            Share tracking link
          </button>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium tap-highlight hover:bg-primary/20"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with support
          </button>
        </div>
      </div>

      {order.status === 'on_the_way' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-dark dark:text-white">Your rider</h3>
            <button
              type="button"
              onClick={fetchRiderLocation}
              disabled={refreshingRider}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingRider ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {(riderInfo.name || riderInfo.phone) && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              {riderInfo.name && (
                <p className="font-medium text-dark dark:text-white">{riderInfo.name}</p>
              )}
              {riderInfo.phone && (
                <a
                  href={`tel:${riderInfo.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium tap-highlight hover:bg-red-700"
                >
                  <Phone className="w-4 h-4" />
                  Call rider
                </a>
              )}
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Live location — map tab tak dikhegi jab rider /rider page se location share karega.
          </p>
          {riderLocation ? (
            <RiderMap
              storeLat={STORE_LAT}
              storeLng={STORE_LNG}
              riderLat={riderLocation.lat}
              riderLng={riderLocation.lng}
              height={240}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
              Location tab dikhegi jab rider &quot;Start sharing location&quot; karega.
            </p>
          )}
        </div>
      )}

      {isDeliveredUnrated && !showRatingPopup && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-dark mb-3">Rate this order</h3>
          <p className="text-sm text-gray-600 mb-4">
            How was your experience? (Delivery & quality)
          </p>
          <button
            onClick={() => setShowRatingPopup(true)}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-red-700"
          >
            Rate now
          </button>
        </div>
      )}

      {order.status === 'delivered' && order.rating_stars != null && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-dark">Thank you for your rating!</h3>
            <span className="px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-medium">
              Rated
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <StarRatingDisplay value={order.rating_stars} size="md" />
            <span className="font-semibold">{order.rating_stars}/5</span>
          </div>
          {(order.rating_delivery != null || order.rating_quality != null) && (
            <p className="text-sm text-gray-600 mt-2">
              Delivery: {order.rating_delivery ?? '—'}/5 · Quality:{' '}
              {order.rating_quality ?? '—'}/5
            </p>
          )}
          {order.rating_comment && (
            <p className="text-sm text-gray-600 mt-2 italic">
              &ldquo;{order.rating_comment}&rdquo;
            </p>
          )}
        </div>
      )}

      <div className="relative">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step.key} className="flex gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  idx <= currentIndex
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {idx < currentIndex ? (
                  <Check className="w-5 h-5" />
                ) : idx === 0 ? (
                  <Package className="w-5 h-5" />
                ) : idx === currentIndex ? (
                  <Truck className="w-5 h-5" />
                ) : (
                  <span className="text-sm">{idx + 1}</span>
                )}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    idx < currentIndex ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-6">
              <p
                className={`font-medium ${
                  idx <= currentIndex ? 'text-dark' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <OrderChatPanel
        orderId={order.id}
        orderNumber={formatOrderNumber(order.id)}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userId={user?.id}
      />
      <Link
        href="/menu"
        className="block w-full py-4 bg-primary text-white font-bold rounded-xl text-center hover:bg-red-700"
      >
        Order More
      </Link>
    </div>
  );
}
