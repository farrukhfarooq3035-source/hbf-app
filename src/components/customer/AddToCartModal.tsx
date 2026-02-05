'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { hapticMedium } from '@/lib/haptic';
import { RippleButton } from '@/components/customer/RippleButton';
import { useCartStore } from '@/store/cart-store';
import { PIZZA_ADDONS } from '@/lib/pizza-addons';
import type { Product } from '@/types';

interface AddToCartModalProps {
  product: Product;
  discountPercent?: number;
  onClose: () => void;
}

export function AddToCartModal({ product, discountPercent, onClose }: AddToCartModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const sizeOptions = product.size_options ?? [];
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.name ?? null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const selectedSizeOption = selectedSize ? sizeOptions.find((s) => s.name === selectedSize) : null;
  const basePrice = selectedSizeOption?.price ?? product.price;
  const addonTotal = selectedAddons.reduce((sum, name) => {
    const addon = PIZZA_ADDONS.find((a) => a.name === name);
    return sum + (addon?.price ?? 0);
  }, 0);
  const unitPrice = discountPercent
    ? Math.round((basePrice + addonTotal) * (1 - discountPercent / 100))
    : basePrice + addonTotal;

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAdd = () => {
    hapticMedium();
    addItem({
      product_id: product.id,
      name: product.name,
      price: unitPrice,
      qty: 1,
      size: selectedSize ?? undefined,
      addons: selectedAddons.length ? selectedAddons : undefined,
      size_options: sizeOptions.length ? sizeOptions : undefined,
      addon_options: PIZZA_ADDONS.map((a) => ({ name: a.name, price: a.price })),
      is_pizza: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl animate-scale-in">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {sizeOptions.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      selectedSize === s.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {s.name} Rs {s.price}/-
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-medium text-sm mb-2">Add-ons</p>
            <div className="space-y-2">
              {PIZZA_ADDONS.map((a) => (
                <label
                  key={a.name}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(a.name)}
                    onChange={() => toggleAddon(a.name)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="flex-1">{a.name}</span>
                  <span className="font-medium text-primary">+Rs {a.price}/-</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <RippleButton
            onClick={handleAdd}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700"
          >
            Add to Cart - Rs {unitPrice}/-
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
