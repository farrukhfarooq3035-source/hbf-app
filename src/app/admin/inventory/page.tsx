'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    item_name: '',
    stock_qty: '',
    unit: 'pcs',
    low_stock_threshold: '10',
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('item_name');
      if (error) throw error;
      return data;
    },
  });

  const createItem = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('inventory').insert({
        item_name: data.item_name,
        stock_qty: parseFloat(data.stock_qty),
        unit: data.unit,
        low_stock_threshold: parseFloat(data.low_stock_threshold),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setForm({
        item_name: '',
        stock_qty: '',
        unit: 'pcs',
        low_stock_threshold: '10',
      });
    },
  });

  const addLog = useMutation({
    mutationFn: async ({
      id,
      type,
      qty,
      note,
    }: {
      id: string;
      type: 'in' | 'out';
      qty: number;
      note?: string;
    }) => {
      const { error } = await supabase.from('inventory_logs').insert({
        inventory_id: id,
        type_in_out: type,
        qty,
        note,
      });
      if (error) throw error;
      const item = items?.find((i) => i.id === id);
      const newQty =
        type === 'in'
          ? (item?.stock_qty || 0) + qty
          : (item?.stock_qty || 0) - qty;
      await supabase
        .from('inventory')
        .update({ stock_qty: newQty })
        .eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Inventory</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Stock Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            placeholder="Item name"
            value={form.item_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, item_name: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Stock qty"
            value={form.stock_qty}
            onChange={(e) =>
              setForm((f) => ({ ...f, stock_qty: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border"
          />
          <input
            placeholder="Unit (pcs, kg)"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Low stock alert"
            value={form.low_stock_threshold}
            onChange={(e) =>
              setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border"
          />
          <button
            onClick={() => createItem.mutate(form)}
            disabled={!form.item_name || !form.stock_qty}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items?.map((item) => {
          const isLow =
            item.stock_qty <= (item.low_stock_threshold || 0);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl shadow-sm border p-6 flex justify-between items-center ${
                isLow ? 'border-red-200 bg-red-50/30' : ''
              }`}
            >
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  {item.item_name}
                  {isLow && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </h3>
                <p className="text-gray-600">
                  {item.stock_qty} {item.unit}
                  {isLow && (
                    <span className="text-red-600 ml-2">(Low stock!)</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    addLog.mutate({
                      id: item.id,
                      type: 'in',
                      qty: 10,
                      note: 'Stock in',
                    })
                  }
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
                >
                  + In
                </button>
                <button
                  onClick={() =>
                    addLog.mutate({
                      id: item.id,
                      type: 'out',
                      qty: 5,
                      note: 'Stock out',
                    })
                  }
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm"
                >
                  - Out
                </button>
                <button
                  onClick={() => deleteItem.mutate(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!items?.length && !isLoading && (
        <div className="text-center py-12 text-gray-500">No inventory items.</div>
      )}
    </div>
  );
}
