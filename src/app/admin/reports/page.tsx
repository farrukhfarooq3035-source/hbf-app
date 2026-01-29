'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';
import { Download, FileText } from 'lucide-react';
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

const defaultEnd = new Date();
const defaultStart = subDays(defaultEnd, 6);

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<'7' | '30' | 'custom'>('7');
  const [fromDate, setFromDate] = useState(format(defaultStart, 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(defaultEnd, 'yyyy-MM-dd'));
  const printRef = useRef<HTMLDivElement>(null);

  const start = period === 'custom' ? fromDate : format(subDays(new Date(), period === '30' ? 29 : 6), 'yyyy-MM-dd');
  const end = period === 'custom' ? toDate : format(new Date(), 'yyyy-MM-dd');

  const { data: salesData } = useQuery({
    queryKey: ['reports-sales', start, end],
    queryFn: async () => {
      const result = [];
      const startD = new Date(start + 'T00:00:00');
      const endD = new Date(end + 'T23:59:59');
      for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
        const dayStr = format(d, 'yyyy-MM-dd');
        const { data } = await supabase
          .from('orders')
          .select('total_price')
          .gte('created_at', `${dayStr}T00:00:00`)
          .lt('created_at', `${dayStr}T23:59:59`);
        const total = data?.reduce((s, o) => s + (o.total_price || 0), 0) || 0;
        result.push({
          date: format(d, 'MMM d'),
          sales: total,
        });
      }
      return result;
    },
  });

  const { data: expensesData } = useQuery({
    queryKey: ['reports-expenses', start, end],
    queryFn: async () => {
      const { data } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', start)
        .lte('date', end);
      return data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    },
  });

  const { data: rangeOrders } = useQuery({
    queryKey: ['reports-orders-range', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_price, status, customer_name, phone, created_at')
        .gte('created_at', start + 'T00:00:00')
        .lte('created_at', end + 'T23:59:59')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const totalSales =
    salesData?.reduce((s, d) => s + d.sales, 0) || 0;
  const totalExpenses = expensesData || 0;
  const profit = totalSales - totalExpenses;

  const { data: ratingsData } = useQuery({
    queryKey: ['reports-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('rating_stars, rating_delivery, rating_quality, rated_at')
        .not('rating_stars', 'is', null);
      if (error) throw error;
      const rated = data || [];
      const n = rated.length;
      if (n === 0) {
        return {
          totalRated: 0,
          avgStars: 0,
          avgDelivery: 0,
          avgQuality: 0,
          ratedOrders: [],
        };
      }
      const avgStars =
        rated.reduce((s, o) => s + (o.rating_stars || 0), 0) / n;
      const withDelivery = rated.filter((o) => o.rating_delivery != null);
      const avgDelivery =
        withDelivery.length > 0
          ? withDelivery.reduce((s, o) => s + (o.rating_delivery || 0), 0) /
            withDelivery.length
          : 0;
      const withQuality = rated.filter((o) => o.rating_quality != null);
      const avgQuality =
        withQuality.length > 0
          ? withQuality.reduce((s, o) => s + (o.rating_quality || 0), 0) /
            withQuality.length
          : 0;
      return {
        totalRated: n,
        avgStars,
        avgDelivery,
        avgQuality,
        ratedOrders: rated,
      };
    },
  });

  const exportCSV = () => {
    const rows = rangeOrders || [];
    const headers = ['Order #', 'Date', 'Customer', 'Phone', 'Total (Rs)', 'Status'];
    const csvRows = [
      headers.join(','),
      ...rows.map((o) =>
        [
          formatOrderNumber(o.id),
          o.created_at ? format(new Date(o.created_at), 'yyyy-MM-dd HH:mm') : '',
          `"${(o.customer_name || '').replace(/"/g, '""')}"`,
          (o.phone || '').replace(/,/g, ' '),
          o.total_price ?? '',
          o.status ?? '',
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hbf-report-${start}-to-${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>HBF Report ${start} to ${end}</title>
      <style>body{font-family:sans-serif;padding:20px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f5f5f5;}</style>
      </head><body>
      <h1>HBF Report</h1>
      <p>Period: ${start} to ${end}</p>
      <p><strong>Total Sales:</strong> Rs ${totalSales}/- &nbsp; <strong>Expenses:</strong> Rs ${totalExpenses}/- &nbsp; <strong>Profit:</strong> Rs ${profit}/-</p>
      <h2>Daily Sales</h2>
      <table><tr><th>Date</th><th>Sales (Rs)</th></tr>
      ${(salesData || []).map((d) => `<tr><td>${d.date}</td><td>${d.sales}</td></tr>`).join('')}
      </table>
      <h2>Orders</h2>
      <table><tr><th>Order #</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr>
      ${(rangeOrders || []).map((o) => `<tr><td>${formatOrderNumber(o.id)}</td><td>${o.created_at ? format(new Date(o.created_at), 'yyyy-MM-dd HH:mm') : ''}</td><td>${o.customer_name || ''}</td><td>${o.total_price}</td><td>${o.status}</td></tr>`).join('')}
      </table>
      </body></html>
    `);
    win.document.close();
    win.print();
    win.close();
  };

  return (
    <div className="p-6" ref={printRef}>
      <h1 className="text-2xl font-bold text-dark mb-6">Reports</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setPeriod('7')}
          className={`px-4 py-2 rounded-xl font-medium ${
            period === '7' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPeriod('30')}
          className={`px-4 py-2 rounded-xl font-medium ${
            period === '30' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setPeriod('custom')}
          className={`px-4 py-2 rounded-xl font-medium ${
            period === 'custom' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Custom
        </button>
        {period === 'custom' && (
          <>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
            <span className="self-center">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </>
        )}
        <div className="flex-1" />
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium"
        >
          <Download className="w-4 h-4" />
          Export Excel (CSV)
        </button>
        <button
          onClick={printReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-red-700 font-medium"
        >
          <FileText className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-primary">Rs {totalSales}/-</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-orange-600">
            Rs {totalExpenses}/-
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Profit</p>
          <p
            className={`text-2xl font-bold ${
              profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            Rs {profit}/-
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Rated Orders</p>
          <p className="text-2xl font-bold text-amber-600">
            {ratingsData?.totalRated ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Avg. Overall</p>
          <p className="text-2xl font-bold text-amber-600">
            {ratingsData?.totalRated
              ? ratingsData.avgStars.toFixed(1)
              : '—'}/5
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Avg. Delivery</p>
          <p className="text-2xl font-bold text-amber-600">
            {ratingsData?.avgDelivery
              ? ratingsData.avgDelivery.toFixed(1)
              : '—'}/5
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Avg. Quality</p>
          <p className="text-2xl font-bold text-amber-600">
            {ratingsData?.avgQuality
              ? ratingsData.avgQuality.toFixed(1)
              : '—'}/5
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-lg mb-4">Daily Sales</h2>
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
