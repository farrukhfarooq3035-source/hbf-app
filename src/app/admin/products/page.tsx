'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/use-menu';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
  });
  const [addProductImage, setAddProductImage] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: categories } = useCategories();
  const uniqueCategories = useMemo(() => {
    if (!categories?.length) return [];
    const seen = new Set<string>();
    return categories.filter((c) => {
      const key = (c.name ?? '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          price: parseFloat(data.price),
          description: data.description || null,
          category_id: data.category_id || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText || 'Failed to add product');
      }
      const { id } = await res.json();
      return id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setForm({ name: '', price: '', description: '', category_id: '' });
      setAddProductImage(null);
    },
  });

  const uploadProductImage = async (productId: string, file: File) => {
    setUploadingId(productId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('productId', productId);
      const res = await fetch('/api/products/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price) return;
    const nameLower = form.name.trim().toLowerCase();
    const exists = products?.some((p) => p.name?.toLowerCase() === nameLower);
    if (exists) {
      alert(`Product "${form.name}" already exists. Use a different name.`);
      return;
    }
    try {
      const productId = await createProduct.mutateAsync(form);
      if (addProductImage) {
        await uploadProductImage(productId, addProductImage);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add product');
    }
  };

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <select
            value={form.category_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, category_id: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border"
          >
            <option value="">Select category</option>
            {uniqueCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAddProductImage(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
          <button
            onClick={handleAddProduct}
            disabled={!form.name || !form.price || createProduct.isPending}
            className="flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {createProduct.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="search"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-xl border text-gray-900"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                ?.filter((p) =>
                  !search.trim()
                    ? true
                    : p.name?.toLowerCase().includes(search.trim().toLowerCase())
                )
                .map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          —
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">Rs {p.price}/-</td>
                  <td className="p-4 text-gray-500">
                    {(p.categories as { name?: string })?.name || '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <input
                        ref={(el) => { fileInputRefs.current[p.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadProductImage(p.id, file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[p.id]?.click()}
                        disabled={uploadingId === p.id}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50"
                        title="Upload image"
                      >
                        {uploadingId === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteProduct.mutate(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
        {!products?.length && !isLoading && (
          <div className="p-12 text-center text-gray-500">
            No products. Add some or run Import Menu.
          </div>
        )}
      </div>
    </div>
  );
}
