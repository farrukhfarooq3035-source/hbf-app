'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  Download,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useTopSellingProducts } from '@/hooks/use-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatOrderNumber } from '@/lib/order-utils';

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'All channels' },
  { value: 'online', label: 'Online' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeaway', label: 'Takeaway' },
];

export default function AdminDashboardPage() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [channelFilter, setChannelFilter] = useState<'all' | 'online' | 'walk_in' | 'dine_in' | 'takeaway'>('all');

  const { data: todayOrders } = useQuery({
    queryKey: ['orders-today', channelFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('id, total_price, status, customer_name, phone, address, created_at')
        .gte('created_at', `${todayStr}T00:00:00`)
        .lt('created_at', `${todayStr}T23:59:59`)
        .order('created_at', { ascending: false });
      if (channelFilter !== 'all') {
        query = query.eq('order_channel', channelFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ['orders-pending', channelFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('id')
        .in('status', ['new', 'preparing', 'ready', 'on_the_way']);
      if (channelFilter !== 'all') {
        query = query.eq('order_channel', channelFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['orders-recent', channelFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('id, total_price, status, customer_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (channelFilter !== 'all') {
        query = query.eq('order_channel', channelFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales-chart', channelFilter],
    queryFn: async () => {
      const days = 7;
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dayStr = format(d, 'yyyy-MM-dd');
        let query = supabase
          .from('orders')
          .select('total_price')
          .gte('created_at', `${dayStr}T00:00:00`)
          .lt('created_at', `${dayStr}T23:59:59`);
        if (channelFilter !== 'all') {
          query = query.eq('order_channel', channelFilter);
        }
        const { data } = await query;
        const total = data?.reduce((s, o) => s + (o.total_price || 0), 0) || 0;
        result.push({
          date: format(d, 'MMM d'),
          sales: total,
        });
      }
      return result;
    },
  });

  const todaySales = todayOrders?.reduce((s, o) => s + (o.total_price || 0), 0) || 0;
  const totalOrders = todayOrders?.length || 0;
  const { data: topProducts } = useTopSellingProducts(
    5,
    channelFilter === 'all' ? null : channelFilter
  );

  const exportTodayCSV = () => {
    const rows = todayOrders || [];
    const headers = ['Order #', 'Date', 'Customer', 'Phone', 'Address', 'Total (Rs)', 'Status'];
    const csvRows = [
      headers.join(','),
      ...rows.map((o) =>
        [
          formatOrderNumber(o.id),
          o.created_at ? format(new Date(o.created_at), 'yyyy-MM-dd HH:mm') : '',
          `"${(o.customer_name || '').replace(/"/g, '""')}"`,
          (o.phone || '').replace(/,/g, ' '),
          `"${(o.address || '').replace(/"/g, '""')}"`,
          o.total_price ?? '',
          o.status ?? '',
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hbf-orders-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasPending = (pendingOrders?.length ?? 0) > 0;

  return (
    <div className="p-6">
      {hasPending && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="h-4 w-4 flex-shrink-0 rounded-full bg-amber-500 animate-pulse" title="Alert ON" />
          <span className="font-semibold text-amber-800">Pending orders alert: ON</span>
          <span className="text-amber-700">— {pendingOrders?.length} order(s) need attention</span>
          <Link
            href="/admin/orders/online"
            className="ml-auto rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            View orders
          </Link>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Channel:</span>
          <select
            value={channelFilter}
            onChange={(e) =>
              setChannelFilter(e.target.value as 'all' | 'online' | 'walk_in' | 'dine_in' | 'takeaway')
            }
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-800">Today Sales</p>
              <p className="text-2xl font-bold">Rs {todaySales}/-</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-800">Today Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div
          className={`rounded-2xl p-6 shadow-sm border-2 ${
            hasPending ? 'border-amber-400 bg-amber-50/50' : 'border border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-4 w-4 rounded-full ${hasPending ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}
                title={hasPending ? 'Alert: Pending orders' : 'No pending orders'}
              />
              <span className={`text-sm font-semibold ${hasPending ? 'text-amber-700' : 'text-gray-700'}`}>
                {hasPending ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasPending ? 'bg-amber-100' : 'bg-blue-100'}`}>
              <Clock className={`w-6 h-6 ${hasPending ? 'text-amber-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-800">Pending Orders</p>
              <p className="text-2xl font-bold">{pendingOrders?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-800">Status</p>
              <p className="text-lg font-bold text-green-600">Live</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Bestsellers */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Top 5 Bestsellers
          </h2>
          <ul className="space-y-2">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                <span className="font-medium text-gray-900">
                  {i + 1}. {p.name}
                </span>
                <span className="text-sm text-gray-600">Rs {(p.size_options?.[0]?.price ?? p.price)}/-</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Orders</h2>
            <Link
              href="/admin/orders/online"
              className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {(recentOrders || []).length === 0 ? (
              <li className="text-sm text-gray-800 py-2">No orders yet</li>
            ) : (
              (recentOrders || []).map((o) => (
                <li key={o.id}>
                  <Link
                    href="/admin/orders/online"
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium">{formatOrderNumber(o.id)}</span>
                    <span className="text-gray-800">Rs {o.total_price}/-</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        o.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {o.status}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Today&apos;s Orders</h2>
            <button
              type="button"
              onClick={exportTodayCSV}
              disabled={!todayOrders?.length}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <p className="text-sm text-gray-800 mb-2">
            Download today&apos;s orders as CSV for records.
          </p>
          {todayOrders?.length ? (
            <p className="text-sm text-gray-800">
              {todayOrders.length} order(s) — click Export CSV to download.
            </p>
          ) : (
            <p className="text-sm text-gray-800">No orders today yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="font-bold text-lg mb-4">Sales (Last 7 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" tickFormatter={(v) => `Rs ${v}`} />
              <Tooltip formatter={(v: number) => [`Rs ${v}/-`, 'Sales']} />
              <Bar dataKey="sales" fill="#E50914" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
