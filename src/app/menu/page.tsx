'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCategories, useProducts, useDeals, useTopSellingDeals } from '@/hooks/use-menu';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { ProductCard } from '@/components/customer/ProductCard';
import { DealCard } from '@/components/customer/DealCard';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import Link from 'next/link';
import { Heart, Clock } from 'lucide-react';

const RECENT_SEARCH_KEY = 'hbf-recent-search';
const RECENT_SEARCH_MAX = 5;

/** Special view key: top_sale = deals in same grid as products */
const TOP_SALE_VIEW = 'top_sale';
const MAIN_DEALS_LIMIT = 12;

/** Dedupe categories by name so same category does not show twice */
function uniqueCategoriesByName<T extends { id: string; name: string }>(list: T[] | undefined): T[] {
  if (!list?.length) return [];
  const seen = new Set<string>();
  return list.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
}

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(RECENT_SEARCH_KEY);
    return s ? (JSON.parse(s) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(term: string) {
  if (!term.trim()) return;
  const prev = getRecentSearches().filter((t) => t.toLowerCase() !== term.trim().toLowerCase());
  const next = [term.trim(), ...prev].slice(0, RECENT_SEARCH_MAX);
  try {
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
  } catch {}
}

export default function MenuPage() {
  /** null | 'top_sale' | categoryId — null = all products */
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const { deliveryMode, setDeliveryMode } = useCartStore();
  const { productIds: favProductIds, dealIds: favDealIds } = useFavoritesStore();
  const { isOpen, openTime, closeTime } = useBusinessHours();

  const { data: categories, isLoading: catsLoading } = useCategories();
  const uniqueCategories = useMemo(() => uniqueCategoriesByName(categories), [categories]);
  const isCategoryId = selectedView && selectedView !== TOP_SALE_VIEW;
  const { data: products, isLoading: productsLoading } = useProducts(
    isCategoryId ? selectedView : undefined
  );
  const { data: deals } = useDeals();
  const { data: allProducts } = useProducts(undefined);
  const { data: topSellingDeals = [] } = useTopSellingDeals(MAIN_DEALS_LIMIT);
  /** Sirf top 12: by sales jab RPC chal raha ho, warna pehle 12 deals */
  const mainDeals = useMemo(() => {
    const list =
      topSellingDeals.length > 0 ? topSellingDeals : (deals || []);
    return list.slice(0, MAIN_DEALS_LIMIT);
  }, [topSellingDeals, deals]);

  useEffect(() => setRecentSearches(getRecentSearches()), []);

  const minN = priceMin === '' ? null : Number(priceMin);
  const maxN = priceMax === '' ? null : Number(priceMax);
  const bySearch = (p: { name: string }) =>
    p.name.toLowerCase().includes(search.toLowerCase());
  const byPrice = (price: number) =>
    (minN == null || price >= minN) && (maxN == null || price <= maxN);

  const filteredProducts = useMemo(() => {
    let list = products?.filter(bySearch) ?? [];
    if (minN != null || maxN != null) {
      list = list.filter((p) => byPrice(p.size_options?.[0]?.price ?? p.price));
    }
    return list;
  }, [products, search, minN, maxN]);

  const filteredMainDeals = useMemo(() => {
    if (minN == null && maxN == null) return mainDeals;
    return mainDeals.filter((d) => byPrice(d.price));
  }, [mainDeals, minN, maxN]);

  const favoriteProducts = useMemo(
    () => (allProducts || []).filter((p) => favProductIds.includes(p.id)),
    [allProducts, favProductIds]
  );
  const favoriteDeals = useMemo(
    () => (deals || []).filter((d) => favDealIds.includes(d.id)),
    [deals, favDealIds]
  );
  const hasFavorites = favoriteProducts.length > 0 || favoriteDeals.length > 0;

  const showDealsGrid = selectedView === TOP_SALE_VIEW;
  const showProductsGrid = !showDealsGrid && (isCategoryId || selectedView === null);

  const categoryPills = [
    { key: TOP_SALE_VIEW, label: 'Top Sale' },
    ...uniqueCategories.map((c) => ({ key: c.id, label: c.name })),
  ];

  const handleSearchBlur = () => {
    if (search.trim()) addRecentSearch(search.trim());
    setRecentSearches(getRecentSearches());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-4 space-y-4">
        {!isOpen && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">We&apos;re closed</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Open {openTime} – {closeTime}. You can browse the menu; orders can be placed when we&apos;re open.
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setDeliveryMode('delivery' as const)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors tap-highlight ${
              deliveryMode === 'delivery'
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Delivery
          </button>
          <button
            onClick={() => setDeliveryMode('pickup' as const)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors tap-highlight ${
              deliveryMode === 'pickup' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Pickup
          </button>
        </div>

        <div className="relative">
          <input
            type="search"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={handleSearchBlur}
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Recent:</span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearch(term)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 tap-highlight"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            min={0}
            className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            min={0}
            className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        {hasFavorites && (
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-primary text-primary" />
              Favorites
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {favoriteProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {favoriteDeals.map((d) => (
                <DealCard key={d.id} deal={d} grid />
              ))}
            </div>
          </div>
        )}

        {filteredMainDeals.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-3">Deals</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {filteredMainDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-bold text-lg mb-3">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categoryPills.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium tap-highlight ${
                  selectedView === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3">Menu</h2>
          {          showDealsGrid ? (
            filteredMainDeals.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredMainDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} grid />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No deals at the moment.</p>
              </div>
            )
          ) : productsLoading || catsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No products found.</p>
              <Link href="/admin" className="hidden md:inline-block text-primary underline mt-2">
                Go to Admin to add menu
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
