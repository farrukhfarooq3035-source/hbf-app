'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isProductFavorite, toggleProduct } = useFavoritesStore();
  const isFav = isProductFavorite(product.id);
  const price = product.size_options?.[0]?.price ?? product.price;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift">
      <Link href={`/menu/product/${product.id}`} className="block relative">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggleProduct(product.id); }}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight"
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
        </button>
        <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🍔</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-dark dark:text-white text-sm line-clamp-2">
            {product.name}
          </h3>
          <p className="text-primary font-bold text-lg mt-1">
            Rs {price}/-
          </p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem({
              product_id: product.id,
              name: product.name,
              price,
            });
          }}
          className="w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-hover transition-colors tap-highlight"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}
