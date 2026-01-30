'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Heart, GitCompare } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useCompareStore } from '@/store/compare-store';
import { FoodImage } from '@/components/customer/FoodImage';
import { ImageModal } from '@/components/customer/ImageModal';
import { QuickPeek } from '@/components/customer/QuickPeek';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isProductFavorite, toggleProduct } = useFavoritesStore();
  const isFav = isProductFavorite(product.id);
  const price = product.size_options?.[0]?.price ?? product.price;
  const [modalOpen, setModalOpen] = useState(false);
  const [quickPeekOpen, setQuickPeekOpen] = useState(false);
  const { add: addToCompare, has: isInCompare } = useCompareStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift dark:ring-1 dark:ring-primary/20 h-full flex flex-col">
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
        <div className="block w-full h-full">
          <FoodImage
            src={product.image_url ?? null}
            alt={product.name}
            aspect="1:1"
            sizes="(max-width: 768px) 50vw, 25vw"
            onDoubleTap={() => toggleProduct(product.id)}
            onLongPress={() => product.image_url && setQuickPeekOpen(true)}
            onClick={() => product.image_url && setModalOpen(true)}
          />
        </div>
      </div>
      <Link href={`/menu/product/${product.id}`} className="block p-3 flex-1 min-h-0">
        <h3 className="font-semibold text-dark dark:text-white text-sm line-clamp-2">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-lg mt-1">
          Rs {price}/-
        </p>
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
          className="w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-hover transition-colors duration-280 ease-smooth tap-highlight"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {quickPeekOpen && product.image_url && (
        <QuickPeek
          imageUrl={product.image_url}
          alt={product.name}
          onClose={() => setQuickPeekOpen(false)}
        />
      )}
      {modalOpen && product.image_url && (
        <ImageModal
          imageUrl={product.image_url}
          alt={product.name}
          title={product.name}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
