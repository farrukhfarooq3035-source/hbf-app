'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MessageCircle } from 'lucide-react';
import { formatOrderNumber } from '@/lib/order-utils';
import type { OrderStatus, Order } from '@/types';
import { InvoiceActions } from '@/components/admin/invoice/InvoiceActions';
import { PaymentLedger } from '@/components/admin/payments/PaymentLedger';
import { AdminOrderChatDrawer } from '@/components/admin/chat/AdminOrderChatDrawer';

type RestaurantChannel = 'dine_in' | 'walk_in' | 'takeaway';

const DINE_IN_COLUMNS: { key: OrderStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'order_on_table', label: 'Order on table' },
  { key: 'closed', label: 'Closed' },
];

const TAKEAWAY_COLUMNS: { key: OrderStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'closed', label: 'Closed' },
];

const CHANNEL_BADGES: Record<string, { label: string; className: string }> = {
  walk_in: { label: 'Walk-in', className: 'bg-emerald-100 text-emerald-700' },
  dine_in: { label: 'Dine-in', className: 'bg-purple-100 text-purple-700' },
  takeaway: { label: 'Takeaway', className: 'bg-amber-100 text-amber-700' },
};

function minsBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 60000;
  return Math.round(d);
}

type ChatThreadMeta = {
  id: string;
  order_id: string;
  last_message_preview?: string | null;
  unread_for_admin?: boolean | null;
  order_chat_messages?: { count: number }[];
};

function RestaurantOrdersContent() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 864e5), 'yyyy-MM-dd');
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'last7' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(today);

  const channels: RestaurantChannel[] = tab === 'dine_in' ? ['dine_in', 'walk_in'] : ['takeaway'];

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders-restaurant', channels],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .in('order_channel', channels)
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
        .select('id, order_id, last_message_preview, unread_for_admin, order_chat_messages(count)')
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
      .channel('admin-chat-meta-rest')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_chat_threads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['order-chat-threads'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_chat_messages' }, () => {
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
    return list;
  }, [orders, datePreset, today, yesterday, customDate]);

  const columns = tab === 'dine_in' ? DINE_IN_COLUMNS : TAKEAWAY_COLUMNS;

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      order,
    }: {
      id: string;
      status: OrderStatus;
      order: { ready_at?: string | null };
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'ready' && !order.ready_at) {
        updates.ready_at = new Date().toISOString();
      }
      const { error } = await supabase.from('orders').update(updates).eq('id', id);
      if (error) throw error;
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      if (status === 'ready' && !order.ready_at) {
        await fetch(`/api/admin/orders/${id}/invoice`, { method: 'POST', headers, body: JSON.stringify({}) });
      }
      if (status === 'closed') {
        await fetch(`/api/admin/orders/${id}/invoice`, { method: 'POST', headers, body: JSON.stringify({}) });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders-restaurant'] }),
  });

  const getOrdersByStatus = (status: OrderStatus) => {
    if (status === 'order_on_table' && tab === 'dine_in') {
      return filteredOrders.filter((o) => o.status === 'order_on_table' || o.status === 'ready');
    }
    return filteredOrders.filter((o) => o.status === status);
  };

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

  return (
    <div className="p-6 text-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Orders</h1>
          <Link
            href="/admin/orders/online"
            className="text-sm font-medium text-primary hover:underline"
          >
            → Online Orders
          </Link>
          <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setTab('dine_in')}
              className={`px-4 py-2 text-sm font-semibold ${
                tab === 'dine_in' ? 'bg-primary text-white' : 'bg-white text-gray-700'
              }`}
            >
              Dine-in
            </button>
            <button
              type="button"
              onClick={() => setTab('takeaway')}
              className={`px-4 py-2 text-sm font-semibold ${
                tab === 'takeaway' ? 'bg-primary text-white' : 'bg-white text-gray-700'
              }`}
            >
              Takeaway
            </button>
          </div>
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
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
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
                const badge = CHANNEL_BADGES[order.order_channel ?? 'walk_in'] ?? CHANNEL_BADGES.walk_in;
                const chatMeta = chatMetaMap.get(order.id);
                const hasUnreadChat = !!chatMeta?.unread_for_admin;
                const lastChatPreview = chatMeta?.last_message_preview;
                const messageCount = (chatMeta as ChatThreadMeta)?.order_chat_messages?.[0]?.count ?? 0;
                return (
                  <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border text-gray-900">
                    <p className="font-semibold text-sm flex items-center gap-1 text-gray-900">
                      {formatOrderNumber(order.id)} • Rs {order.total_price}/-
                      <span className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </p>
                    <p className="text-xs text-gray-900 mt-1">
                      {order.created_at ? format(new Date(order.created_at), 'MMM d, h:mm a') : ''}
                    </p>
                    <p className="text-xs text-gray-900 mt-1">
                      {order.customer_name} • {order.phone}
                    </p>
                    {order.table_number && (
                      <p className="text-xs text-gray-900 mt-1">Table: {order.table_number}</p>
                    )}
                    {order.token_number && (
                      <p className="text-xs text-gray-900 mt-1">Token: {order.token_number}</p>
                    )}
                    {order.notes && (
                      <p className="text-xs text-gray-900 mt-1 truncate" title={order.notes}>
                        Note: {order.notes}
                      </p>
                    )}
                    {order.ready_at != null && (
                      <p className="text-xs text-green-600 mt-1">
                        Ready in: {minsBetween(order.created_at, order.ready_at)} min
                      </p>
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
                        {messageCount > 0 && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            hasUnreadChat ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {messageCount > 99 ? '99+' : messageCount}
                          </span>
                        )}
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
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {columns
                        .filter((c) => c.key !== order.status)
                        .map((c) => (
                          <button
                            key={c.key}
                            onClick={() =>
                              updateStatus.mutate({
                                id: order.id,
                                status: c.key,
                                order: { ready_at: order.ready_at },
                              })
                            }
                            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            → {c.label}
                          </button>
                        ))}
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

export default function RestaurantOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-64 bg-gray-100 rounded-2xl animate-pulse" /></div>}>
      <RestaurantOrdersContent />
    </Suspense>
  );
}
