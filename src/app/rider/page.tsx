'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, CheckCircle, LogOut, Package, Bike, Check, Bell, ExternalLink } from 'lucide-react';
import { formatOrderNumber } from '@/lib/order-utils';
import { RiderOrderDetailDrawer } from '@/components/rider/RiderOrderDetailDrawer';
import { clearRiderSession, setRiderSession } from '@/app/rider/login/page';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface RiderOrder {
  id: string;
  status: string;
  total_price: number;
  customer_name: string;
  address: string;
  phone: string;
  created_at: string;
  delivered_at?: string | null;
  payment_method?: 'cod' | 'jazzcash' | null;
  jazzcash_proof_url?: string | null;
}

export default function RiderPage() {
  const router = useRouter();
  const [rider, setRider] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [paymentReceivedByOrder, setPaymentReceivedByOrder] = useState<Record<string, boolean>>({});
  const [newOrderToast, setNewOrderToast] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<RiderOrder | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());

  const refetchOrders = () => {
    if (!rider?.id) return;
    fetch('/api/rider/orders', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const newOrders = Array.isArray(data) ? data : [];
        setOrders(newOrders);
        const pending = newOrders.filter((o: RiderOrder) => o.status !== 'delivered');
        prevOrderIdsRef.current = new Set(pending.map((o: RiderOrder) => o.id));
      })
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    fetch('/api/rider/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          clearRiderSession();
          router.replace('/rider/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.id) {
          setRider(data);
          setRiderSession(data);
        } else {
          clearRiderSession();
          router.replace('/rider/login');
        }
      })
      .catch(() => {
        clearRiderSession();
        router.replace('/rider/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!rider?.id) return;
    refetchOrders();
  }, [rider?.id]);

  // Realtime: new order notification when rider gets assigned
  useEffect(() => {
    if (!rider?.id) return;
    const ch = supabase
      .channel(`rider-orders-${rider.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `rider_id=eq.${rider.id}`,
        },
        () => {
          const prevIds = new Set(prevOrderIdsRef.current);
          fetch('/api/rider/orders', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
              const newOrders = Array.isArray(data) ? data : [];
              setOrders(newOrders);
              const pending = newOrders.filter((o: RiderOrder) => o.status !== 'delivered');
              const newIds = new Set(pending.map((o: RiderOrder) => o.id));
              const hadNew = [...newIds].some((id: string) => !prevIds.has(id));
              prevOrderIdsRef.current = newIds;
              if (hadNew && pending.length > 0) {
                const latest = pending[0];
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                  new Notification('New Order!', {
                    body: `${formatOrderNumber(latest.id)} · Rs ${latest.total_price}/- · ${latest.customer_name}`,
                    icon: '/logo.png',
                  });
                }
                setNewOrderToast(`New order: ${formatOrderNumber(latest.id)}`);
                setTimeout(() => setNewOrderToast(null), 4000);
              }
            })
            .catch(() => {});
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [rider?.id]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleMarkDelivered = (orderId: string) => {
    setDeliveringOrderId(orderId);
    const received = paymentReceivedByOrder[orderId] ?? true;
    fetch(`/api/rider/orders/${orderId}/deliver`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_received: received }),
    })
      .then((res) => {
        if (res.ok) refetchOrders();
      })
      .finally(() => setDeliveringOrderId(null));
  };

  useEffect(() => {
    if (!rider?.id || !sharing) return;
    setError('');
    const sendLocation = (lat: number, lng: number) => {
      fetch(`/api/riders/${rider.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      })
        .then((res) => {
          if (res.ok) setLastSent(new Date());
        })
        .catch(() => setError('Failed to send location'));
    };
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      () => setError('Location denied. Browser/device pe is site ke liye Location allow karo: Settings → Site settings → Location → Allow. Phir page refresh karo.'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [rider?.id, sharing]);

  const handleLogout = () => {
    fetch('/api/rider/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      clearRiderSession();
      router.replace('/rider/login');
    });
  };

  const pendingOrders = orders.filter((o) => o.status === 'ready' || o.status === 'on_the_way');
  const onTheWay = orders.filter((o) => o.status === 'on_the_way');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const deliveredToday = delivered.filter(
    (o) => o.delivered_at && new Date(o.delivered_at) >= todayStart
  );

  if (loading || !rider) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto p-6 pb-24 bg-gray-50 dark:bg-gray-900 relative">
      {newOrderToast && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-2 p-4 bg-primary text-white rounded-xl shadow-lg animate-slide-up">
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{newOrderToast}</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bike className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-dark dark:text-white">{rider.name}</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-primary">{delivered.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total deliveries</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{deliveredToday.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="font-semibold text-dark dark:text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Location
        </h2>
          {error && (
            <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Location allow karo</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{error}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Chrome: Address bar ke left icon → Site settings → Location → Allow. Safari: Settings → Safari → Location → Ask / While Using.
              </p>
            </div>
          )}
        {!sharing ? (
          <button
            type="button"
            onClick={() => setSharing(true)}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Start sharing location
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-5 h-5" />
              Sharing location
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep this page open. Location is sent every few seconds.
            </p>
            {lastSent && (
              <p className="text-xs text-gray-500">Last sent: {lastSent.toLocaleTimeString()}</p>
            )}
            <button
              type="button"
              onClick={() => setSharing(false)}
              className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Stop sharing
            </button>
          </div>
        )}
      </div>

      {pendingOrders.length > 0 && (
        <>
          <h2 className="font-semibold text-dark dark:text-white mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Pending orders ({pendingOrders.length})
          </h2>
          <ul className="space-y-3 mb-6">
            {pendingOrders.map((o) => (
              <li
                key={o.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedOrder(o)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedOrder(o)}
                className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30 p-4 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-dark dark:text-white">
                      {formatOrderNumber(o.id)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {o.created_at ? format(new Date(o.created_at), 'MMM d, yyyy · h:mm a') : ''}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Rs {o.total_price}/- · {o.customer_name}
                    </p>
                    {o.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={o.address}>
                        {o.address}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    o.status === 'on_the_way' ? 'bg-primary/20 text-primary' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {o.status === 'on_the_way' ? 'On the way' : 'Ready for pickup'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    o.payment_method === 'jazzcash' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {o.payment_method === 'jazzcash' ? 'Jazz Cash' : 'COD'}
                  </span>
                  {o.payment_method === 'jazzcash' && o.jazzcash_proof_url && (
                    <a
                      href={o.jazzcash_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Check proof
                    </a>
                  )}
                </div>
                {o.status === 'on_the_way' && (
                <div className="flex items-center gap-3 pt-2 border-t border-primary/20 mt-2" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentReceivedByOrder[o.id] ?? (o.payment_method === 'jazzcash' ? false : true)}
                      onChange={(e) => setPaymentReceivedByOrder((p) => ({ ...p, [o.id]: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Check className="w-4 h-4 text-green-600" />
                    {o.payment_method === 'jazzcash' ? 'Jazz Cash verified & received' : 'Payment received'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleMarkDelivered(o.id)}
                    disabled={deliveringOrderId === o.id}
                    className="ml-auto py-2 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {deliveringOrderId === o.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Mark delivered
                  </button>
                </div>
              )}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="font-semibold text-dark dark:text-white mb-3 flex items-center gap-2">
        <Package className="w-4 h-4" />
        My deliveries
      </h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-4">No deliveries yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedOrder(o)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedOrder(o)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-dark dark:text-white">
                    {formatOrderNumber(o.id)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {o.created_at ? format(new Date(o.created_at), 'MMM d, yyyy · h:mm a') : ''}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Rs {o.total_price}/- · {o.customer_name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                      o.status === 'delivered'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {o.status === 'delivered' ? 'Delivered' : o.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    o.payment_method === 'jazzcash' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {o.payment_method === 'jazzcash' ? 'Jazz Cash' : 'COD'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RiderOrderDetailDrawer
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
