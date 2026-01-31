'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useProduct } from '@/hooks/use-menu';
import { useCartStore } from '@/store/cart-store';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (product?.size_options?.length) {
      setSelectedSize(product.size_options[0].name);
    } else {
      setSelectedSize(null);
    }
  }, [product?.id]);

  if (isLoading || !product) {
    return (
      <div className="p-4">
        <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-8 bg-gray-100 rounded mt-4 w-2/3 animate-pulse" />
      </div>
    );
  }

  const sizeOptions = product.size_options || [];
  const basePrice = sizeOptions.length
    ? sizeOptions[0].price
    : product.price;
  const selectedPrice = selectedSize
    ? sizeOptions.find((s) => s.name === selectedSize)?.price ?? basePrice
    : basePrice;
  const displayPrice = selectedPrice * qty;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="aspect-square bg-gray-100 relative rounded-b-3xl overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            🍔
          </div>
        )}
      </div>
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <h1 className="text-xl font-bold text-dark dark:text-white">{product.name}</h1>

          {product.description && (
            <div className="mt-4">
              <h2 className="font-semibold text-dark dark:text-white text-sm mb-1">Details</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{product.description}</p>
            </div>
          )}

          {sizeOptions.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold text-dark dark:text-white text-sm mb-2">Size & Price</h2>
              <div className="flex gap-2 flex-wrap">
                {sizeOptions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSize(s.name)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm ${
                      selectedSize === s.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {s.name} | Rs {s.price}/-
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="font-medium text-sm text-gray-700 dark:text-gray-400 mb-2">Notes (optional)</p>
            <input
              type="text"
              placeholder="e.g. No onions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 rounded-lg hover:bg-white"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-2 rounded-lg hover:bg-white"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <span className="text-xl font-bold text-primary">
              Rs {displayPrice}/-
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom">
        <button
          onClick={() => {
            addItem({
              product_id: product.id,
              name: product.name,
              price: selectedPrice,
              qty,
              notes: notes || undefined,
              size: selectedSize || undefined,
            });
          }}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          Add to Cart - Rs {displayPrice}/-
        </button>
      </div>
    </div>
  );
}
