'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminDealsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', price: '' });

  const { data: deals, isLoading } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, deal_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDeal = useMutation({
    mutationFn: async (data: { title: string; price: string }) => {
      const { error } = await supabase.from('deals').insert({
        title: data.title,
        price: parseFloat(data.price),
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      setForm({ title: '', price: '' });
    },
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-deals'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Deals</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Deal</h2>
        <div className="flex gap-4">
          <input
            placeholder="Deal title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="flex-1 px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-32 px-4 py-2 rounded-xl border"
          />
          <button
            onClick={() => createDeal.mutate(form)}
            disabled={!form.title || !form.price}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {deals?.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-2xl shadow-sm border p-6 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg">{deal.title}</h3>
              <p className="text-primary font-semibold">Rs {deal.price}/-</p>
            </div>
            <button
              onClick={() => deleteDeal.mutate(deal.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {!deals?.length && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          No deals. Add some or run Import Menu.
        </div>
      )}
    </div>
  );
}
