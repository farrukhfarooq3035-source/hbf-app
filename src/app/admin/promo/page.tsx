'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPromoPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    min_order: '',
    valid_from: '',
    valid_to: '',
    usage_limit: '',
    is_active: true,
  });

  const { data: promos, isLoading } = useQuery({
    queryKey: ['promo_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPromo = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('promo_codes').insert({
        code: data.code.trim().toUpperCase(),
        type: data.type,
        value: parseFloat(data.value) || 0,
        min_order: parseFloat(data.min_order) || 0,
        valid_from: data.valid_from || null,
        valid_to: data.valid_to || null,
        usage_limit: data.usage_limit ? parseInt(data.usage_limit, 10) : null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo_codes'] });
      setForm({
        code: '',
        type: 'percent',
        value: '',
        min_order: '',
        valid_from: '',
        valid_to: '',
        usage_limit: '',
        is_active: true,
      });
    },
  });

  const deletePromo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promo_codes'] }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('promo_codes').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promo_codes'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Promo Codes</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Promo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            placeholder="Code (e.g. SAVE20)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className="px-4 py-2 rounded-xl border uppercase"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
            className="px-4 py-2 rounded-xl border"
          >
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed Rs off</option>
          </select>
          <input
            type="number"
            placeholder={form.type === 'percent' ? '20' : '50'}
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
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
            type="datetime-local"
            placeholder="Valid from"
            value={form.valid_from}
            onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="datetime-local"
            placeholder="Valid to"
            value={form.valid_to}
            onChange={(e) => setForm((f) => ({ ...f, valid_to: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Usage limit (optional)"
            value={form.usage_limit}
            onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
        </div>
        <button
          onClick={() => createPromo.mutate(form)}
          disabled={!form.code.trim() || !form.value}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Discount</th>
                <th className="text-left p-4">Min order</th>
                <th className="text-left p-4">Valid to</th>
                <th className="text-left p-4">Used</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos?.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4 font-mono font-medium">{p.code}</td>
                  <td className="p-4">{p.type === 'percent' ? `${p.value}% off` : `Rs ${p.value} off`}</td>
                  <td className="p-4">Rs {p.min_order || 0}/-</td>
                  <td className="p-4 text-sm">{p.valid_to ? format(new Date(p.valid_to), 'MMM d, yyyy') : '—'}</td>
                  <td className="p-4">{p.used_count ?? 0}{p.usage_limit != null ? ` / ${p.usage_limit}` : ''}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                      className={`px-2 py-1 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deletePromo.mutate(p.id)}
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
        {(!promos?.length && !isLoading) && (
          <div className="p-12 text-center text-gray-500">No promo codes yet.</div>
        )}
      </div>
    </div>
  );
}
