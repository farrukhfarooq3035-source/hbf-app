'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ChevronRight, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useProducts } from '@/hooks/use-menu';
import { isSuggestedAddon } from '@/lib/suggested-addons';

export function CartBar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const bump = useCartStore((s) => s.bump);
  const setBump = useCartStore((s) => s.setBump);
  const { data: allProducts } = useProducts(undefined);

  useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [bump, setBump]);

  const cartProductIds = new Set(items.map((i) => i.product_id).filter(Boolean));
  const suggestedAddons = (allProducts ?? [])
    .filter((p) => isSuggestedAddon(p.name) && !cartProductIds.has(p.id))
    .slice(0, 3);

  if (itemCount === 0) return null;
  if (pathname.startsWith('/admin')) return null;
  if (pathname === '/cart' || pathname === '/checkout') return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 safe-area-bottom animate-slide-up transition-transform duration-300 ease-out-expo ${bump ? 'animate-cart-bump' : ''}`}
    >
      {/* Suggested add-ons strip (when we have suggestions) */}
      {suggestedAddons.length > 0 && (
        <div className="mx-4 mb-2 p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-premium border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Add to your order
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {suggestedAddons.map((p) => {
              const price = p.size_options?.[0]?.price ?? p.price;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addItem({
                      product_id: p.id,
                      name: p.name,
                      price,
                    });
                  }}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors tap-highlight"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-charcoal dark:text-white truncate max-w-[100px]">
                    {p.name}
                  </span>
                  <span className="text-xs font-bold text-primary">Rs {price}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main floating mini-cart */}
      <Link
        href="/cart"
        className="flex items-center justify-between mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary-deep text-white shadow-lg tap-highlight transition-all duration-280 hover:shadow-xl active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className={`relative p-2 rounded-xl bg-white/20 ${bump ? 'animate-add-success' : ''}`}>
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-accent text-charcoal text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
              {itemCount}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white/90">View Cart</p>
            <p className="text-xs text-white/70">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">Rs {total}/-</span>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>
      </Link>
    </div>
  );
}
