'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import { formatOrderNumber } from '@/lib/order-utils';
import { StarRatingDisplay } from '@/components/customer/StarRating';
import type { OrderStatus } from '@/types';

function minsBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 60000;
  return Math.round(d);
}

const COLUMNS: { key: OrderStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'on_the_way', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const filterRiderId = searchParams.get('rider_id') ?? null;
  const [selectedRiderByOrderId, setSelectedRiderByOrderId] = useState<Record<string, string>>({});

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
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredOrders = filterRiderId
    ? orders?.filter((o) => o.rider_id === filterRiderId) ?? []
    : orders ?? [];

  const orderCountByPhone = (() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      const phone = (o.phone || '').trim();
      if (phone) map.set(phone, (map.get(phone) || 0) + 1);
    });
    return map;
  })();

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
      if (status === 'ready' && !order.ready_at) {
        updates.ready_at = new Date().toISOString();
      }
      if (status === 'delivered' && !order.delivered_at) {
        updates.delivered_at = new Date().toISOString();
      }
      if (status === 'on_the_way' && riderId) {
        updates.rider_id = riderId;
      }
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const getOrdersByStatus = (status: OrderStatus) =>
    filteredOrders.filter((o) => o.status === status);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const filterRider = filterRiderId ? riders?.find((r) => r.id === filterRiderId) : null;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Orders</h1>
        {filterRider && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Filtered by rider: <strong>{filterRider.name}</strong>
            <a href="/admin/orders" className="ml-2 text-primary hover:underline">Clear</a>
          </p>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="flex-shrink-0 w-72 bg-gray-100 rounded-2xl p-4 min-h-[400px]"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              {col.label}
              <span className="text-sm font-normal text-gray-500">
                ({getOrdersByStatus(col.key).length})
              </span>
            </h3>
            <div className="space-y-3">
              {getOrdersByStatus(col.key).map((order) => {
                const phone = (order.phone || '').trim();
                const isRegular = (orderCountByPhone.get(phone) || 0) >= 3;
                const assignedRider = order.rider_id ? riders?.find((r) => r.id === order.rider_id) : null;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-4 shadow-sm border"
                  >
                    <p className="font-semibold text-sm flex items-center gap-1">
                      {formatOrderNumber(order.id)} • Rs {order.total_price}/-
                      {isRegular && (
                        <Star
                          className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0"
                          title="Regular customer (3+ orders)"
                        />
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.created_at
                        ? format(new Date(order.created_at), 'MMM d, h:mm a')
                        : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.customer_name} • {order.phone}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{order.address}</p>
                    {assignedRider && (
                      <p className="text-xs text-primary font-medium mt-1">
                        Rider: {assignedRider.name} ({assignedRider.phone})
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-xs text-gray-600 mt-1 truncate" title={order.notes}>
                        Note: {order.notes}
                      </p>
                    )}
                    {order.distance_km != null && (
                      <p className="text-xs text-gray-600 mt-1">
                        Distance: {Number(order.distance_km).toFixed(1)} km
                      </p>
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
                          <span className="ml-1 text-green-700 font-medium" title="Rider confirmed payment">
                            · Payment received
                          </span>
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
                    {order.status === 'ready' && riders?.length && (
                      <div className="mt-2">
                        <label className="text-xs text-gray-500 block mb-1">Assign rider (for On the way)</label>
                        <select
                          value={selectedRiderByOrderId[order.id] ?? ''}
                          onChange={(e) =>
                            setSelectedRiderByOrderId((s) => ({
                              ...s,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-full text-xs px-2 py-1.5 rounded border border-gray-200"
                        >
                          <option value="">Select rider</option>
                          {riders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {order.status === 'on_the_way' && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Delivered tab sirf rider app se — rider &quot;Mark delivered&quot; karega.
                      </p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {COLUMNS.filter((c) => c.key !== 'delivered').map((c) =>
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
                                  order: {
                                    ready_at: order.ready_at,
                                    delivered_at: order.delivered_at,
                                  },
                                  riderId,
                                });
                              } else {
                                updateStatus.mutate({
                                  id: order.id,
                                  status: c.key,
                                  order: {
                                    ready_at: order.ready_at,
                                    delivered_at: order.delivered_at,
                                  },
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
    </div>
  );
}
