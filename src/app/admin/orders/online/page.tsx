'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Star, MessageCircle } from 'lucide-react';
import { formatOrderNumber } from '@/lib/order-utils';
import { StarRatingDisplay } from '@/components/customer/StarRating';
import type { OrderStatus, Order } from '@/types';
import { InvoiceActions } from '@/components/admin/invoice/InvoiceActions';
import { PaymentLedger } from '@/components/admin/payments/PaymentLedger';
import { AdminOrderChatDrawer } from '@/components/admin/chat/AdminOrderChatDrawer';

const ONLINE_COLUMNS: { key: OrderStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'on_the_way', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
];

function minsBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 60000;
  return Math.round(d);
}

type ChatThreadMeta = {
  id: string;
  order_id: string;
  last_message_at?: string | null;
  last_message_preview?: string | null;
  unread_for_admin?: boolean | null;
};

function OnlineOrdersContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const filterRiderId = searchParams.get('rider_id') ?? null;
  const [selectedRiderByOrderId, setSelectedRiderByOrderId] = useState<Record<string, string>>({});
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 864e5), 'yyyy-MM-dd');
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'last7' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(today);

  const { data: riders } = useQuery({
    queryKey: ['riders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('id, name, phone')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data as { id: string; name: string; phone: string }[];
    },
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders-online'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_channel', 'online')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: chatThreads = [] } = useQuery({
    queryKey: ['order-chat-threads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_chat_threads')
        .select('id, order_id, last_message_at, last_message_preview, unread_for_admin')
        .eq('channel', 'customer_support');
      if (error) return [];
      return (data ?? []) as ChatThreadMeta[];
    },
    staleTime: 15000,
  });

  const chatMetaMap = useMemo(() => {
    const map = new Map<string, ChatThreadMeta>();
    chatThreads.forEach((t) => {
      if (t?.order_id) map.set(t.order_id, t);
    });
    return map;
  }, [chatThreads]);

  useEffect(() => {
    const ch = supabase
      .channel('admin-chat-meta')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_chat_threads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['order-chat-threads'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [queryClient]);

  const filteredOrders = useMemo(() => {
    let list = orders ?? [];
    if (datePreset === 'today') {
      list = list.filter((o) => o.created_at && format(new Date(o.created_at), 'yyyy-MM-dd') === today);
    } else if (datePreset === 'yesterday') {
      list = list.filter((o) => o.created_at && format(new Date(o.created_at), 'yyyy-MM-dd') === yesterday);
    } else if (datePreset === 'last7') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      list = list.filter((o) => o.created_at && new Date(o.created_at) >= cutoff);
    } else {
      list = list.filter((o) => o.created_at && format(new Date(o.created_at), 'yyyy-MM-dd') === customDate);
    }
    if (filterRiderId) list = list.filter((o) => o.rider_id === filterRiderId);
    return list;
  }, [orders, datePreset, today, yesterday, customDate, filterRiderId]);

  const orderCountByPhone = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      const p = (o.phone || '').trim();
      if (p) map.set(p, (map.get(p) || 0) + 1);
    });
    return map;
  }, [filteredOrders]);

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      order,
      riderId,
    }: {
      id: string;
      status: OrderStatus;
      order: { ready_at?: string | null; delivered_at?: string | null };
      riderId?: string | null;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'ready' && !order.ready_at) updates.ready_at = new Date().toISOString();
      if (status === 'delivered' && !order.delivered_at) updates.delivered_at = new Date().toISOString();
      if (status === 'on_the_way' && riderId) updates.rider_id = riderId;
      const { error } = await supabase.from('orders').update(updates).eq('id', id);
      if (error) throw error;
      if (status === 'ready' && !order.ready_at) {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/admin/orders/${id}/invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
          body: JSON.stringify({}),
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders-online'] }),
  });

  const getOrdersByStatus = (status: OrderStatus) =>
    filteredOrders.filter((o) => o.status === status);

  const openChat = (order: Order) => {
    setChatOrder(order);
    setChatDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const filterRider = filterRiderId ? riders?.find((r) => r.id === filterRiderId) : null;

  return (
    <div className="p-6 text-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Online Orders</h1>
          <Link
            href="/admin/orders/restaurant"
            className="text-sm font-medium text-primary hover:underline"
          >
            → Restaurant Orders
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Filter by date:</span>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as 'today' | 'yesterday' | 'last7' | 'custom')}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-gray-900 text-sm font-medium"
          >
            <option value="today">Today ({today})</option>
            <option value="yesterday">Yesterday ({yesterday})</option>
            <option value="last7">Last 7 days</option>
            <option value="custom">Custom date</option>
          </select>
          {datePreset === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-gray-900 text-sm font-medium"
            />
          )}
          <span className="text-sm text-gray-600">({filteredOrders.length} orders)</span>
          {filterRider && (
            <p className="text-sm text-gray-900">
              Rider: <strong>{filterRider.name}</strong>
              <Link href="/admin/orders/online" className="ml-2 text-primary hover:underline">Clear</Link>
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {ONLINE_COLUMNS.map((col) => (
          <div
            key={col.key}
            className="flex-shrink-0 w-72 bg-gray-100 rounded-2xl p-4 min-h-[400px] text-gray-900"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
              {col.label}
              <span className="text-sm font-normal text-gray-700">
                ({getOrdersByStatus(col.key).length})
              </span>
            </h3>
            <div className="space-y-3">
              {getOrdersByStatus(col.key).map((order) => {
                const phone = (order.phone || '').trim();
                const isRegular = (orderCountByPhone.get(phone) || 0) >= 3;
                const assignedRider = order.rider_id ? riders?.find((r) => r.id === order.rider_id) : null;
                const chatMeta = chatMetaMap.get(order.id);
                const hasUnreadChat = !!chatMeta?.unread_for_admin;
                const lastChatPreview = chatMeta?.last_message_preview;
                return (
                  <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border text-gray-900">
                    <p className="font-semibold text-sm flex items-center gap-1 text-gray-900">
                      {formatOrderNumber(order.id)} • Rs {order.total_price}/-
                      <span className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700">
                        Online
                      </span>
                      {isRegular && (
                        <span title="Regular customer (3+ orders)">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-900 mt-1">
                      {order.created_at ? format(new Date(order.created_at), 'MMM d, h:mm a') : ''}
                    </p>
                    <p className="text-xs text-gray-900 mt-1">
                      {order.customer_name} • {order.phone}
                    </p>
                    <p className="text-xs text-gray-900 truncate">{order.address}</p>
                    {assignedRider && (
                      <p className="text-xs text-primary font-medium mt-1">
                        Rider: {assignedRider.name} ({assignedRider.phone})
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-xs text-gray-900 mt-1 truncate" title={order.notes}>
                        Note: {order.notes}
                      </p>
                    )}
                    {order.distance_km != null && (
                      <p className="text-xs text-gray-900 mt-1">Distance: {Number(order.distance_km).toFixed(1)} km</p>
                    )}
                    {order.ready_at != null && (
                      <p className="text-xs text-green-600 mt-1">
                        Ready in: {minsBetween(order.created_at, order.ready_at)} min
                      </p>
                    )}
                    {order.delivered_at != null && (
                      <p className="text-xs text-green-600 mt-1">
                        Delivered in: {minsBetween(order.created_at, order.delivered_at)} min
                        {order.payment_received_at != null && (
                          <span className="ml-1 text-green-700 font-medium">· Payment received</span>
                        )}
                      </p>
                    )}
                    {order.rating_stars != null && (
                      <div className="flex items-center gap-2 mt-2 text-amber-600">
                        <StarRatingDisplay value={order.rating_stars} size="sm" />
                        <span className="text-xs">
                          {order.rating_stars}/5
                          {order.rating_delivery != null && ` · D:${order.rating_delivery}`}
                          {order.rating_quality != null && ` Q:${order.rating_quality}`}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => openChat(order)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                          hasUnreadChat ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Support chat
                        {hasUnreadChat && (
                          <span className="inline-flex items-center rounded-full bg-primary text-white px-2 py-0.5 text-[10px]">
                            New
                          </span>
                        )}
                      </button>
                      {lastChatPreview && (
                        <p className="text-[11px] text-gray-500 truncate">Last: {lastChatPreview}</p>
                      )}
                    </div>
                    <div className="mt-3">
                      <InvoiceActions order={order} items={order.order_items ?? []} />
                    </div>
                    <div className="mt-2">
                      <PaymentLedger
                        orderId={order.id}
                        amountPaid={order.amount_paid}
                        amountDue={order.amount_due}
                      />
                    </div>
                    {order.status === 'ready' && riders?.length && (
                      <div className="mt-2">
                        <label className="text-xs text-gray-900 block mb-1">Assign rider (for On the way)</label>
                        <select
                          value={selectedRiderByOrderId[order.id] ?? ''}
                          onChange={(e) =>
                            setSelectedRiderByOrderId((s) => ({ ...s, [order.id]: e.target.value }))
                          }
                          className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 text-gray-900 bg-white"
                        >
                          <option value="">Select rider</option>
                          {riders.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {order.status === 'on_the_way' && (
                      <p className="text-xs text-amber-600 mt-2">
                        Delivered tab sirf rider app se — rider &quot;Mark delivered&quot; karega.
                      </p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {ONLINE_COLUMNS.filter((c) => c.key !== 'delivered').map((c) =>
                        c.key !== order.status ? (
                          <button
                            key={c.key}
                            onClick={() => {
                              if (c.key === 'on_the_way' && order.status === 'ready') {
                                const riderId = selectedRiderByOrderId[order.id];
                                if (!riderId) {
                                  alert('Select a rider first');
                                  return;
                                }
                                updateStatus.mutate({
                                  id: order.id,
                                  status: c.key,
                                  order: { ready_at: order.ready_at, delivered_at: order.delivered_at },
                                  riderId,
                                });
                              } else {
                                updateStatus.mutate({
                                  id: order.id,
                                  status: c.key,
                                  order: { ready_at: order.ready_at, delivered_at: order.delivered_at },
                                });
                              }
                            }}
                            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            → {c.label}
                          </button>
                        ) : null
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <AdminOrderChatDrawer
        open={chatDrawerOpen}
        orderId={chatOrder?.id ?? null}
        orderNumber={chatOrder ? formatOrderNumber(chatOrder.id) : undefined}
        customerName={chatOrder?.customer_name}
        onClose={() => setChatDrawerOpen(false)}
      />
    </div>
  );
}

export default function OnlineOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-64 bg-gray-100 rounded-2xl animate-pulse" /></div>}>
      <OnlineOrdersContent />
    </Suspense>
  );
}
