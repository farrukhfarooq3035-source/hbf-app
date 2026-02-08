'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Heart, GitCompare } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useCompareStore } from '@/store/compare-store';
import { FoodImage } from '@/components/customer/FoodImage';
import { QuickPeek } from '@/components/customer/QuickPeek';
import type { Deal } from '@/types';

interface DealCardProps {
  deal: Deal & { deal_items?: { product_id: string; qty: number; product_name?: string }[] };
  grid?: boolean;
}

const cardBase =
  'bg-white dark:bg-gray-800 rounded-premium-lg shadow-premium border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-280 hover:shadow-lg dark:hover:shadow-xl active:scale-[0.98] dark:ring-1 dark:ring-primary/20';

export function DealCard({ deal, grid }: DealCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isDealFavorite, toggleDeal } = useFavoritesStore();
  const isFav = isDealFavorite(deal.id);
  const [quickPeekOpen, setQuickPeekOpen] = useState(false);
  const { add: addToCompare, has: isInCompare } = useCompareStore();

  if (grid) {
    return (
      <div className={`${cardBase}`}>
        <div className="relative">
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            {deal.image_url && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  addToCompare({
                    id: deal.id,
                    type: 'deal',
                    imageUrl: deal.image_url!,
                    title: deal.title,
                  });
                }}
                className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight ${isInCompare(deal.id) ? 'text-primary' : 'text-gray-500'}`}
                title="Add to compare"
              >
                <GitCompare className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); toggleDeal(deal.id); }}
              className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight"
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
            </button>
          </div>
          <Link href={`/menu/deal/${deal.id}`} className="block">
            <FoodImage
              src={deal.image_url ?? null}
              alt={deal.title}
              aspect="1:1"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </Link>
        </div>
        <Link href={`/menu/deal/${deal.id}`} className="block p-3">
          <h3 className="font-semibold text-dark dark:text-white text-sm line-clamp-2">
            {deal.title}
          </h3>
          {(deal.deal_items?.length ?? 0) > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {deal.deal_items!.slice(0, 3).map((i) => `${i.qty > 1 ? `${i.qty}x ` : ''}${i.product_name ?? 'Item'}`).join(', ')}
              {(deal.deal_items!.length ?? 0) > 3 ? '...' : ''}
            </p>
          )}
          <p className="text-primary font-bold text-lg mt-1">
            Rs {deal.price}/-
          </p>
        </Link>
        <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem({
                deal_id: deal.id,
                name: deal.title,
                price: deal.price,
                qty: 1,
              });
            }}
            className="w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-hover transition-colors duration-280 ease-smooth tap-highlight touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {quickPeekOpen && deal.image_url && (
          <QuickPeek imageUrl={deal.image_url} alt={deal.title} onClose={() => setQuickPeekOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 w-[280px] ${cardBase}`}>
      <div className="relative">
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {deal.image_url && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addToCompare({
                  id: deal.id,
                  type: 'deal',
                  imageUrl: deal.image_url!,
                  title: deal.title,
                });
              }}
              className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight ${isInCompare(deal.id) ? 'text-primary' : 'text-gray-500'}`}
              title="Add to compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleDeal(deal.id); }}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow tap-highlight"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-gray-500'}`} />
          </button>
        </div>
        <Link href={`/menu/deal/${deal.id}`} className="block">
          <FoodImage
            src={deal.image_url ?? null}
            alt={deal.title}
            aspect="4:3"
            sizes="280px"
          />
        </Link>
      </div>
      <Link href={`/menu/deal/${deal.id}`} className="block p-3">
        <h3 className="font-bold text-dark dark:text-white">{deal.title}</h3>
        {(deal.deal_items?.length ?? 0) > 0 && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {deal.deal_items!.slice(0, 3).map((i) => `${i.qty > 1 ? `${i.qty}x ` : ''}${i.product_name ?? 'Item'}`).join(', ')}
            {(deal.deal_items!.length ?? 0) > 3 ? '...' : ''}
          </p>
        )}
        <p className="text-primary font-bold text-xl mt-1">
          Rs {deal.price}/-
        </p>
      </Link>
      <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem({
              deal_id: deal.id,
              name: deal.title,
              price: deal.price,
              qty: 1,
            });
          }}
          className="w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-hover transition-colors duration-280 ease-smooth tap-highlight touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {quickPeekOpen && deal.image_url && (
        <QuickPeek imageUrl={deal.image_url} alt={deal.title} onClose={() => setQuickPeekOpen(false)} />
      )}
    </div>
  );
}
