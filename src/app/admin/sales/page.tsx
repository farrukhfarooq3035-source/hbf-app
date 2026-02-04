'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';
import { Download, Filter } from 'lucide-react';

type ChannelFilter = 'all' | 'online' | 'walk_in' | 'dine_in' | 'takeaway';

interface SalesRow {
  id: string;
  created_at: string;
  order_channel: string | null;
  service_mode: string | null;
  customer_name: string | null;
  phone: string | null;
  total_price: number | null;
  sub_total: number | null;
  discount_amount: number | null;
  tax_amount: number | null;
  delivery_fee: number | null;
  amount_paid: number | null;
  amount_due: number | null;
  status: string | null;
  invoice_status: string | null;
  receipt_number: string | null;
}

const CHANNEL_OPTIONS: { value: ChannelFilter; label: string }[] = [
  { value: 'all', label: 'All channels' },
  { value: 'online', label: 'Online' },
  { value: 'walk_in', label: 'Walk-in POS' },
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeaway', label: 'Takeaway' },
];

function formatCurrency(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) return 'Rs 0/-';
  return `Rs ${Math.round(value).toLocaleString()}/-`;
}

export default function SalesRecordPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const last30 = format(subDays(new Date(), 29), 'yyyy-MM-dd');

  const [fromDate, setFromDate] = useState(last30);
  const [toDate, setToDate] = useState(today);
  const [channel, setChannel] = useState<ChannelFilter>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['sales-record', fromDate, toDate, channel],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(
          'id, created_at, order_channel, service_mode, customer_name, phone, total_price, sub_total, discount_amount, tax_amount, delivery_fee, amount_paid, amount_due, status, invoice_status, receipt_number'
        )
        .gte('created_at', `${fromDate}T00:00:00`)
        .lte('created_at', `${toDate}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (channel !== 'all') {
        query = query.eq('order_channel', channel);
      }
      const { data: rows, error } = await query;
      if (error) throw error;
      return (rows || []) as SalesRow[];
    },
  });

  const summary = useMemo(() => {
    const rows = data ?? [];
    const totalRevenue = rows.reduce((sum, row) => sum + (row.total_price ?? 0), 0);
    const totalPaid = rows.reduce((sum, row) => sum + (row.amount_paid ?? 0), 0);
    const totalDue = rows.reduce((sum, row) => sum + (row.amount_due ?? 0), 0);
    return {
      totalRevenue,
      totalPaid,
      totalDue,
      count: rows.length,
    };
  }, [data]);

  const exportCsv = () => {
    const rows = data ?? [];
    if (!rows.length) return;
    const header = [
      'Order ID',
      'Date',
      'Channel',
      'Service',
      'Customer',
      'Phone',
      'Subtotal',
      'Discount',
      'Tax',
      'Delivery fee',
      'Total',
      'Amount paid',
      'Amount due',
      'Status',
      'Invoice status',
      'Receipt #',
    ];
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.id,
          row.created_at ? format(new Date(row.created_at), 'yyyy-MM-dd HH:mm') : '',
          row.order_channel ?? '',
          row.service_mode ?? '',
          row.customer_name ? `"${row.customer_name.replace(/"/g, '""')}"` : '',
          row.phone ?? '',
          row.sub_total ?? 0,
          row.discount_amount ?? 0,
          row.tax_amount ?? 0,
          row.delivery_fee ?? 0,
          row.total_price ?? 0,
          row.amount_paid ?? 0,
          row.amount_due ?? 0,
          row.status ?? '',
          row.invoice_status ?? '',
          row.receipt_number ?? '',
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-record-${fromDate}-to-${toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Record</h1>
          <p className="text-sm text-gray-700">
            Track revenue, payments, and dues across online and restaurant channels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <Filter className="h-4 w-4 text-gray-600" />
            <span>Channel</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelFilter)}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-primary focus:outline-none"
            >
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none"
          />
          <span className="text-sm text-gray-700">to</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none"
          />
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
            type="button"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-700">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {formatCurrency(summary.totalRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-700">Amount received</p>
          <p className="mt-2 text-2xl font-semibold text-green-600">
            {formatCurrency(summary.totalPaid)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-700">Outstanding dues</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {formatCurrency(summary.totalDue)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-700">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.count}</p>
          <p className="text-xs text-gray-600">Limited to 1000 latest orders</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Channel</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-4 py-3 text-right">Delivery</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Due</th>
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="px-4 py-6 text-center text-sm text-gray-700">
                    Loading sales data...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">
                      {row.created_at
                        ? format(new Date(row.created_at), 'MMM d, yyyy HH:mm')
                        : '—'}
                    </td>
                    <td className="px-4 py-2 font-semibold text-gray-900">{row.id}</td>
                    <td className="px-4 py-2 text-gray-700">{row.order_channel ?? '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{row.service_mode ?? '—'}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {row.customer_name || 'Walk-in guest'}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {formatCurrency(row.sub_total)}
                    </td>
                    <td className="px-4 py-2 text-right text-red-500">
                      {formatCurrency(row.discount_amount)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {formatCurrency(row.tax_amount)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {formatCurrency(row.delivery_fee)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">
                      {formatCurrency(row.total_price)}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {formatCurrency(row.amount_paid)}
                    </td>
                    <td className="px-4 py-2 text-right text-amber-600">
                      {formatCurrency(row.amount_due)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      <div className="flex flex-col text-xs">
                        <span>{row.invoice_status ?? '—'}</span>
                        <span className="text-gray-600">{row.receipt_number ?? ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{row.status ?? ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="px-4 py-6 text-center text-sm text-gray-700">
                    No sales found for the selected range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
