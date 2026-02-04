'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Heart, GitCompare } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useCompareStore } from '@/store/compare-store';
import { FoodImage } from '@/components/customer/FoodImage';
import { QuickPeek } from '@/components/customer/QuickPeek';
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

  useEffect(() => {
    if (sizeOptions.length) {
      setSelectedSize(sizeOptions[0].name);
    } else {
      setSelectedSize(null);
    }
  }, [product.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift dark:ring-1 dark:ring-primary/20 h-full flex flex-col image-pop">
      <div className="relative flex-shrink-0 aspect-square w-full">
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
              className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight ${isInCompare(product.id) ? 'text-primary' : 'text-gray-500'}`}
              title="Add to compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleProduct(product.id); }}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
          </button>
        </div>
        <Link href={`/menu/product/${product.id}`} className="block w-full h-full">
          <FoodImage
            src={product.image_url ?? null}
            alt={product.name}
            aspect="1:1"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
      </div>
      <Link href={`/menu/product/${product.id}`} className="block p-3 flex-1 min-h-0">
        <h3 className="font-semibold text-dark dark:text-white text-sm line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
            {product.description}
          </p>
        )}
        {sizeOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {sizeOptions.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(s.name);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedSize === s.name
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {s.name} Rs {s.price}/-
              </button>
            ))}
          </div>
        )}
        <div className="mt-1 flex items-baseline gap-2">
          {discountPercent ? (
            <>
              <span className="text-gray-500 dark:text-gray-400 line-through text-sm">Rs {originalPrice}/-</span>
              <span className="text-primary font-bold text-lg">Rs {price}/-</span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">{discountPercent}% off</span>
            </>
          ) : (
            <p className="text-primary font-bold text-lg">Rs {price}/-</p>
          )}
        </div>
      </Link>
      <div className="px-3 pb-3">
        {isPizza ? (
          <Link
            href={`/menu/product/${product.id}`}
            className="block w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-hover transition-colors duration-280 ease-smooth tap-highlight text-center"
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
            className="w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-hover transition-colors duration-280 ease-smooth tap-highlight"
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
