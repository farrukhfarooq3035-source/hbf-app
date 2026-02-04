'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Heart, GitCompare } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useCompareStore } from '@/store/compare-store';
import { FoodImage } from '@/components/customer/FoodImage';
import { QuickPeek } from '@/components/customer/QuickPeek';
import { PremiumBadge } from '@/components/customer/PremiumBadge';
import { getProductBadge } from '@/lib/product-badges';
import { isPizzaProduct } from '@/lib/pizza-addons';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  /** Optional discount % (e.g. 10 for Happy Hour) - shows original struck through, discounted price */
  discountPercent?: number;
}

export function ProductCard({ product, discountPercent }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isProductFavorite, toggleProduct } = useFavoritesStore();
  const isFav = isProductFavorite(product.id);
  const sizeOptions = product.size_options ?? [];
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeOptions.length ? sizeOptions[0].name : null
  );
  const selectedSizeOption = selectedSize
    ? sizeOptions.find((s) => s.name === selectedSize)
    : null;
  const originalPrice = selectedSizeOption?.price ?? product.size_options?.[0]?.price ?? product.price;
  const price = discountPercent
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;
  const [quickPeekOpen, setQuickPeekOpen] = useState(false);
  const { add: addToCompare, has: isInCompare } = useCompareStore();
  const isPizza = sizeOptions.length > 0 && isPizzaProduct(product);
  const badge = getProductBadge(product.name);

  useEffect(() => {
    if (sizeOptions.length) {
      setSelectedSize(sizeOptions[0].name);
    } else {
      setSelectedSize(null);
    }
  }, [product.id]);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-premium-lg shadow-premium border border-gray-100 dark:border-gray-700/60 overflow-hidden h-full flex flex-col transition-all duration-280 ease-smooth hover:shadow-lg dark:hover:shadow-xl active:scale-[0.98]">
      <div className="relative flex-shrink-0 aspect-square w-full overflow-hidden">
        {/* Premium badge - top left */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <PremiumBadge type={badge} />
          </div>
        )}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {product.image_url && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addToCompare({
                  id: product.id,
                  type: 'product',
                  imageUrl: product.image_url!,
                  title: product.name,
                });
              }}
              className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight backdrop-blur-sm ${isInCompare(product.id) ? 'text-primary' : 'text-gray-500'}`}
              title="Add to compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleProduct(product.id); }}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight backdrop-blur-sm"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
          </button>
        </div>
        <Link href={`/menu/product/${product.id}`} className="block w-full h-full">
          <div className="relative w-full h-full">
            <FoodImage
              src={product.image_url ?? null}
              alt={product.name}
              aspect="1:1"
              sizes="(max-width: 768px) 50vw, 25vw"
              className="transition-transform duration-300 ease-out-expo group-hover:scale-105"
            />
            {/* Subtle steam/warm overlay for premium feel */}
            {product.image_url && (
              <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-60"
                aria-hidden
              />
            )}
          </div>
        </Link>
      </div>
      <Link href={`/menu/product/${product.id}`} className="block px-4 pt-4 flex-1 min-h-0">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm sm:text-base line-clamp-2 leading-tight">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        {sizeOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {sizeOptions.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(s.name);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedSize === s.name
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {s.name} Rs {s.price}/-
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-baseline gap-2">
          {discountPercent ? (
            <>
              <span className="text-gray-500 dark:text-gray-400 line-through text-sm">Rs {originalPrice}/-</span>
              <span className="text-primary font-bold text-lg">Rs {price}/-</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">{discountPercent}% off</span>
            </>
          ) : (
            <p className="text-primary font-bold text-lg">Rs {price}/-</p>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4 pt-2">
        {isPizza ? (
          <Link
            href={`/menu/product/${product.id}`}
            className="block w-full py-3 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-primary-hover transition-all duration-280 ease-smooth tap-highlight text-center shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Customize & Add
          </Link>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                product_id: product.id,
                name: product.name,
                price,
                size: selectedSize ?? undefined,
              });
            }}
            className="w-full py-3 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-primary-hover transition-all duration-280 ease-smooth tap-highlight shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add {selectedSize ? `(${selectedSize})` : ''}
          </button>
        )}
      </div>
      {quickPeekOpen && product.image_url && (
        <QuickPeek
          imageUrl={product.image_url}
          alt={product.name}
          onClose={() => setQuickPeekOpen(false)}
        />
      )}
    </div>
  );
}
