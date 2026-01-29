'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import type { Deal } from '@/types';

interface DealCardProps {
  deal: Deal & { deal_items?: { product_id: string; qty: number }[] };
  /** Same size/alignment as ProductCard in the menu grid (Top section) */
  grid?: boolean;
}

export function DealCard({ deal, grid }: DealCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isDealFavorite, toggleDeal } = useFavoritesStore();
  const isFav = isDealFavorite(deal.id);

  if (grid) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift">
        <Link href={`/menu/deal/${deal.id}`} className="block relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleDeal(deal.id); }}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
          </button>
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
            {deal.image_url ? (
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-4xl">🎁</span>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-dark dark:text-white text-sm line-clamp-2">
              {deal.title}
            </h3>
            <p className="text-primary font-bold text-lg mt-1">
              Rs {deal.price}/-
            </p>
          </div>
        </Link>
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                deal_id: deal.id,
                name: deal.title,
                price: deal.price,
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

  return (
    <div className="flex-shrink-0 w-[280px] bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift">
      <Link href={`/menu/deal/${deal.id}`} className="block relative">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggleDeal(deal.id); }}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight"
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
        </button>
        <div className="aspect-[4/3] bg-gray-100 relative">
          {deal.image_url ? (
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-cover"
              sizes="280px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-5xl">🎁</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-dark">{deal.title}</h3>
          <p className="text-primary font-bold text-xl mt-1">
            Rs {deal.price}/-
          </p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem({
              deal_id: deal.id,
              name: deal.title,
              price: deal.price,
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
