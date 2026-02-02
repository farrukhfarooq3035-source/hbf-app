'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/use-menu';
import { Sparkles, Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';

export default function AdminHappyHourPage() {
  const { data: products = [], isLoading } = useProducts(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/happy-hour')
      .then((res) => (res.ok ? res.json() : { productIds: [] }))
      .then((data: { productIds?: string[] }) => {
        setSelectedIds(Array.isArray(data.productIds) ? data.productIds : []);
      })
      .catch(() => setSelectedIds([]));
  }, []);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setSaved(false);
  };

  const moveDown = (index: number) => {
    if (index >= selectedIds.length - 1) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setSaved(false);
  };

  const remove = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setSaved(false);
  };

  const save = () => {
    setSaving(true);
    setSaved(false);
    fetch('/api/happy-hour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selectedIds }),
    })
      .then((res) => {
        if (res.ok) setSaved(true);
      })
      .finally(() => setSaving(false));
  };

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as { id: string; name: string; price: number }[];
  const availableProducts = products.filter((p) => !selectedIds.includes(p.id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Sparkles className="w-7 h-7 text-amber-500" />
        Happy Hour Deals
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select products to show during Happy Hour (3–5pm) and after midnight. Discount % is set in Settings.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-lg mb-3">Selected Products ({selectedIds.length})</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag order shown on menu. Click trash to remove.
          </p>
          {selectedProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
              No products selected. Add from the list on the right.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedProducts.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(i)}
                      disabled={i === selectedProducts.length - 1}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                  <span className="flex-1 font-medium truncate">{p.name}</span>
                  <span className="text-primary font-semibold">Rs {p.price}/-</span>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <p className="mt-2 text-center text-green-600 text-sm">Saved!</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-lg mb-3">All Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Click + to add to Happy Hour deals.
          </p>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : availableProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
              {products.length === 0 ? 'No products in menu.' : 'All products are already selected.'}
            </p>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-primary/30"
                >
                  <span className="flex-1 font-medium truncate">{p.name}</span>
                  <span className="text-primary font-semibold">Rs {p.price}/-</span>
                  <button
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className="p-2 rounded-lg bg-primary text-white hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
