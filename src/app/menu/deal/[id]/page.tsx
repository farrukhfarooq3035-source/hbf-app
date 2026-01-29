'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { useDeal } from '@/hooks/use-menu';
import { useCartStore } from '@/store/cart-store';

export default function DealDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: deal, isLoading } = useDeal(id);
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  if (isLoading || !deal) {
    return (
      <div className="p-4">
        <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const totalPrice = deal.price * qty;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="aspect-video bg-gray-100 relative rounded-b-3xl overflow-hidden">
        {deal.image_url ? (
          <Image
            src={deal.image_url}
            alt={deal.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-primary/10 to-accent/10">
            🎁
          </div>
        )}
      </div>
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h1 className="text-xl font-bold text-dark">{deal.title}</h1>
          <p className="text-primary font-bold text-2xl mt-2">
            Rs {deal.price}/-
          </p>

          {deal.deal_items && deal.deal_items.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-sm text-gray-700 mb-2">Includes</p>
              <ul className="space-y-1 text-gray-600">
                {deal.deal_items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item.qty > 1 && `${item.qty}x `}
                    Item
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              Rs {totalPrice}/-
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom">
        <button
          onClick={() => {
            addItem({
              deal_id: deal.id,
              name: deal.title,
              price: deal.price,
              qty,
            });
          }}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          Add to Cart - Rs {totalPrice}/-
        </button>
      </div>
    </div>
  );
}
