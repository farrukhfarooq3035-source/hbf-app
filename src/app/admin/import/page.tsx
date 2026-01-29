'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Check, Loader2 } from 'lucide-react';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_PIZZAS,
  SEED_DEALS,
} from '@/data/menu-seed';
import { supabase } from '@/lib/supabase';

export default function AdminImportPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [preview, setPreview] = useState<{
    categories: typeof SEED_CATEGORIES;
    products: (typeof SEED_PRODUCTS)[0][];
    deals: typeof SEED_DEALS;
  } | null>(null);

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      setStep('done');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const handleLoadSeed = () => {
    setPreview({
      categories: SEED_CATEGORIES,
      products: [...SEED_PRODUCTS, ...SEED_PIZZAS],
      deals: SEED_DEALS,
    });
    setStep('review');
  };

  const handleConfirm = () => {
    seedMutation.mutate();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Import Menu</h1>

      {step === 'upload' && (
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-xl">
          <p className="text-gray-600 mb-6">
            Import menu from the pre-built seed dataset (extracted from HBF menu
            images). For OCR from custom images, use an external OCR service and
            paste the parsed data.
          </p>
          <button
            onClick={handleLoadSeed}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-700"
          >
            <Upload className="w-5 h-5" />
            Load Seed Menu (Preview)
          </button>
        </div>
      )}

      {step === 'review' && preview && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <h2 className="p-4 font-bold border-b">Categories ({preview.categories.length})</h2>
            <div className="p-4 max-h-48 overflow-y-auto">
              <ul className="space-y-1 text-sm">
                {preview.categories.map((c, i) => (
                  <li key={i}>{c.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <h2 className="p-4 font-bold border-b">Products ({preview.products.length})</h2>
            <div className="p-4 max-h-64 overflow-y-auto">
              <ul className="space-y-1 text-sm">
                {preview.products.slice(0, 30).map((p, i) => (
                  <li key={i}>
                    {p.name} - Rs {p.price}/-
                  </li>
                ))}
                {preview.products.length > 30 && (
                  <li className="text-gray-500">
                    ... and {preview.products.length - 30} more
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <h2 className="p-4 font-bold border-b">Deals ({preview.deals.length})</h2>
            <div className="p-4 max-h-48 overflow-y-auto">
              <ul className="space-y-1 text-sm">
                {preview.deals.map((d, i) => (
                  <li key={i}>
                    {d.title} - Rs {d.price}/-
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep('upload')}
              className="px-6 py-3 bg-gray-200 rounded-xl font-medium"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={seedMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {seedMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              Confirm Import to Supabase
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-xl">
          <div className="flex items-center gap-3 text-green-600 mb-4">
            <Check className="w-8 h-8" />
            <span className="font-bold text-lg">Import Complete!</span>
          </div>
          <p className="text-gray-600 mb-6">
            Menu has been imported to Supabase. You can now view products and
            deals in the admin panel.
          </p>
          <button
            onClick={() => setStep('upload')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-700"
          >
            Import Again
          </button>
        </div>
      )}
    </div>
  );
}
