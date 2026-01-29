'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminZonesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    min_order: '',
    delivery_fee: '',
    free_above: '',
  });

  const { data: zones, isLoading } = useQuery({
    queryKey: ['delivery_zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const createZone = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('delivery_zones').insert({
        name: data.name.trim(),
        min_order: parseFloat(data.min_order) || 0,
        delivery_fee: parseFloat(data.delivery_fee) || 0,
        free_above: data.free_above ? parseFloat(data.free_above) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery_zones'] });
      setForm({ name: '', min_order: '', delivery_fee: '', free_above: '' });
    },
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery_zones'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Delivery Zones</h1>
      <p className="text-gray-600 text-sm mb-6">
        Define areas with min order, delivery fee, and free delivery above amount. First matching zone (by name in address or default) is used at checkout.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Zone</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            placeholder="Zone name (e.g. DHA, Gulberg)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Min order (Rs)"
            value={form.min_order}
            onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Delivery fee (Rs)"
            value={form.delivery_fee}
            onChange={(e) => setForm((f) => ({ ...f, delivery_fee: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Free above (Rs, optional)"
            value={form.free_above}
            onChange={(e) => setForm((f) => ({ ...f, free_above: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <button
            onClick={() => createZone.mutate(form)}
            disabled={!form.name.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Min order (Rs)</th>
                <th className="text-left p-4">Delivery fee (Rs)</th>
                <th className="text-left p-4">Free above (Rs)</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones?.map((z) => (
                <tr key={z.id} className="border-t">
                  <td className="p-4 font-medium">{z.name}</td>
                  <td className="p-4">{z.min_order ?? 0}</td>
                  <td className="p-4">{z.delivery_fee ?? 0}</td>
                  <td className="p-4">{z.free_above ?? '—'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteZone.mutate(z.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!zones?.length && !isLoading) && (
          <div className="p-12 text-center text-gray-500">No delivery zones. Add one or use default (geo-based) fee.</div>
        )}
      </div>
    </div>
  );
}
