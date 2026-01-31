'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';

export default function AdminDealsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', price: '' });
  const [addDealImage, setAddDealImage] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
    mutationFn: async (data: { title: string; price: string; imageFile?: File | null }) => {
      const { data: inserted, error } = await supabase
        .from('deals')
        .insert({
          title: data.title,
          price: parseFloat(data.price),
          is_active: true,
        })
        .select('id')
        .single();
      if (error) throw error;
      return { dealId: inserted.id as string, imageFile: data.imageFile };
    },
    onSuccess: async ({ dealId, imageFile }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      setForm({ title: '', price: '' });
      setAddDealImage(null);
      if (imageFile) {
        setUploadingId(dealId);
        try {
          const fd = new FormData();
          fd.append('file', imageFile);
          fd.append('dealId', dealId);
          const res = await fetch('/api/deals/upload', { method: 'POST', body: fd });
          if (!res.ok) throw new Error(await res.text());
          queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
        } catch (e) {
          alert(e instanceof Error ? e.message : 'Image upload failed');
        } finally {
          setUploadingId(null);
        }
      }
    },
  });

  const uploadDealImage = async (dealId: string, file: File) => {
    setUploadingId(dealId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('dealId', dealId);
      const res = await fetch('/api/deals/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddDeal = async () => {
    if (!form.title || !form.price) return;
    try {
      await createDeal.mutateAsync({ ...form, imageFile: addDealImage });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add deal');
    }
  };

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-deals'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Deals</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Deal</h2>
        <div className="flex flex-wrap items-end gap-4">
          <input
            placeholder="Deal title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border text-gray-900"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-32 px-4 py-2 rounded-xl border text-gray-900"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAddDealImage(e.target.files?.[0] || null)}
              className="text-sm text-gray-900"
            />
          </div>
          <button
            onClick={handleAddDeal}
            disabled={!form.title || !form.price || createDeal.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {createDeal.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-gray-900">Image</th>
                <th className="text-left p-4 text-gray-900">Title</th>
                <th className="text-left p-4 text-gray-900">Price</th>
                <th className="text-left p-4 text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals?.map((deal) => (
                <tr key={deal.id} className="border-t">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                      {deal.image_url ? (
                        <Image
                          src={deal.image_url}
                          alt={deal.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          —
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{deal.title}</td>
                  <td className="p-4 text-primary font-semibold">Rs {deal.price}/-</td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <input
                        ref={(el) => { fileInputRefs.current[deal.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadDealImage(deal.id, file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[deal.id]?.click()}
                        disabled={uploadingId === deal.id}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50"
                        title="Upload / change image"
                      >
                        {uploadingId === deal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteDeal.mutate(deal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete deal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!deals?.length && !isLoading && (
        <div className="text-center py-12 text-gray-800">
          No deals. Add some or run Import Menu.
        </div>
      )}
    </div>
  );
}
