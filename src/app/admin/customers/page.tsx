'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerRow {
  phone: string;
  name: string;
  total_orders: number;
  last_order_at: string;
}

export default function AdminCustomersPage() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, customer_name, phone, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const byPhone = new Map<string, { name: string; count: number; lastAt: string }>();
      for (const o of orders || []) {
        const key = (o.phone || '').trim();
        if (!key) continue;
        const existing = byPhone.get(key);
        if (!existing) {
          byPhone.set(key, {
            name: o.customer_name || '—',
            count: 1,
            lastAt: o.created_at,
          });
        } else {
          existing.count += 1;
          if (o.created_at > existing.lastAt) {
            existing.lastAt = o.created_at;
            existing.name = o.customer_name || existing.name;
          }
        }
      }

      const list: CustomerRow[] = [];
      byPhone.forEach((v, phone) => {
        list.push({
          phone,
          name: v.name,
          total_orders: v.count,
          last_order_at: v.lastAt,
        });
      });
      list.sort((a, b) => b.total_orders - a.total_orders);
      return list;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
      <p className="text-gray-600 text-sm mb-4">
        Unique customers by phone. Regular customers (3+ orders) show a star.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Total Orders</th>
                <th className="text-left p-4">Last Order</th>
                <th className="text-left p-4">Priority</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c) => (
                <tr key={c.phone} className="border-t">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.total_orders}</td>
                  <td className="p-4 text-gray-800">
                    {format(new Date(c.last_order_at), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="p-4">
                    {c.total_orders >= 3 ? (
                      <span
                        className="inline-flex items-center gap-1 text-amber-500"
                        title="Regular customer (3+ orders)"
                      >
                        <Star className="w-4 h-4 fill-amber-500" />
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!customers?.length && (
          <div className="p-12 text-center text-gray-800">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
