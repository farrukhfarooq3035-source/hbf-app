'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMenuCategories, useProducts, useDeals, useHappyHourProductIds } from '@/hooks/use-menu';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { ProductCard } from '@/components/customer/ProductCard';
import { DealCard } from '@/components/customer/DealCard';
import { ReviewsSection } from '@/components/customer/ReviewsSection';
import { FoodImage } from '@/components/customer/FoodImage';
import { HorizontalScrollStrip } from '@/components/customer/HorizontalScrollStrip';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import Link from 'next/link';
import { Heart, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Product } from '@/types';

const RECENT_SEARCH_KEY = 'hbf-recent-search';
const RECENT_SEARCH_MAX = 5;

/** Fixed category order for main page (HBF Deals excluded from pills - has its own section) */
const CATEGORY_ORDER = [
  'HBF Burgers',
  'GRILLED Burgers',
  'HBF Pizzas',
  'HBF Injected Broast',
  'HBF Shawarma',
  'WINGS | Sandwiches | PASTA',
  'BBQ & Fish',
  'FRIES & Nuggets',
  'PIZZA Burgers',
  'DRINKS & Extras',
];

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const { deliveryMode, setDeliveryMode } = useCartStore();
  const { productIds: favProductIds, dealIds: favDealIds } = useFavoritesStore();
  const { isOpen, openTime, closeTime, isHappyHour, isAfterMidnight, showHappyHourDeals, happyHourStart, happyHourEnd, happyHourDiscount } = useBusinessHours();

  const { data: categories, isLoading: catsLoading } = useMenuCategories();
  const { data: deals } = useDeals();
  const { data: allProducts } = useProducts(undefined);
  const { data: happyHourProductIds = [] } = useHappyHourProductIds();

  /** Happy Hour products: from admin selection, 10% off during 3-5pm or after midnight */
  const happyHourProducts = useMemo(() => {
    if (!allProducts?.length || !showHappyHourDeals || !happyHourProductIds.length) return [];
    const idSet = new Set(happyHourProductIds);
    return allProducts.filter((p) => idSet.has(p.id));
  }, [allProducts, showHappyHourDeals, happyHourProductIds]);

  /** Products grouped by category NAME (needed before sorting categories by price) */
  const productsByCategoryName = useMemo(() => {
    const map: Record<string, Product[]> = {};
    const catIdToName = new Map<string, string>((categories || []).map((c) => [c.id, c.name ?? '']));
    (allProducts || []).forEach((p) => {
      const name = p.category_id ? (catIdToName.get(p.category_id) ?? '').trim() : '';
      if (!name) return;
      if (!map[name]) map[name] = [];
      map[name].push(p);
    });
    return map;
  }, [allProducts, categories]);

  /** Categories: filtered by API; sorted by CATEGORY_ORDER; HBF Deals excluded from pills */
  const uniqueCategories = useMemo(() => {
    const isHbfDeals = (n: string) => (n ?? '').toLowerCase().includes('hbf') && (n ?? '').toLowerCase().includes('deal');
    const list = uniqueCategoriesByName(categories).filter((c) => !isHbfDeals(c.name));
    const orderMap = new Map(CATEGORY_ORDER.map((n, i) => [n, i]));
    return [...list].sort((a, b) => {
      const ia = orderMap.get(a.name) ?? 999;
      const ib = orderMap.get(b.name) ?? 999;
      return ia - ib;
    });
  }, [categories]);

  useEffect(() => setRecentSearches(getRecentSearches()), []);

  const minN = priceMin === '' ? null : Number(priceMin);
  const maxN = priceMax === '' ? null : Number(priceMax);
  const bySearchProduct = (p: { name: string }) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
  const bySearchDeal = (d: { title: string }) =>
    !search.trim() || d.title.toLowerCase().includes(search.toLowerCase());
  const byPrice = (price: number) =>
    (minN == null || price >= minN) && (maxN == null || price <= maxN);

  /** First product image per category (for category card) */
  const categoryImageMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    uniqueCategories.forEach((c) => {
      const list = productsByCategoryName[c.name] ?? [];
      const firstWithImage = list.find((p) => p.image_url);
      map[c.id] = firstWithImage?.image_url ?? null;
    });
    return map;
  }, [uniqueCategories, productsByCategoryName]);

  /** Filtered products per category (by name), sorted by price low → high */
  const filteredProductsByCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    const getPrice = (p: Product) => p.size_options?.[0]?.price ?? p.price;
    uniqueCategories.forEach((c) => {
      let list = (productsByCategoryName[c.name] ?? []).filter(bySearchProduct);
      if (minN != null || maxN != null) {
        list = list.filter((p) => byPrice(getPrice(p)));
      }
      list = [...list].sort((a, b) => getPrice(a) - getPrice(b));
      map[c.id] = list;
    });
    return map;
  }, [uniqueCategories, productsByCategoryName, search, minN, maxN]);

  const favoriteProducts = useMemo(
    () => (allProducts || []).filter((p) => favProductIds.includes(p.id)),
    [allProducts, favProductIds]
  );
  const favoriteDeals = useMemo(
    () => (deals || []).filter((d) => favDealIds.includes(d.id)),
    [deals, favDealIds]
  );
  const hasFavorites = favoriteProducts.length > 0 || favoriteDeals.length > 0;

  /** HBF Deals: all active deals from deals table, filtered by search + price */
  const filteredAllDeals = useMemo(() => {
    const seen = new Set<string>();
    return (deals || [])
      .filter((d) => d.is_active !== false)
      .filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        if (!bySearchDeal(d)) return false;
        if (minN != null || maxN != null) return byPrice(d.price);
        return true;
      });
  }, [deals, search, minN, maxN]);

  /** HBF Deals products: from products table (category "HBF Deals"), filtered by search + price */
  const hbfDealsProducts = useMemo(() => {
    const getPrice = (p: Product) => p.size_options?.[0]?.price ?? p.price;
    const hbfDealsKey = Object.keys(productsByCategoryName).find(
      (k) => (k ?? '').toLowerCase().includes('hbf') && (k ?? '').toLowerCase().includes('deal')
    );
    if (!hbfDealsKey) return [];
    let list = (productsByCategoryName[hbfDealsKey] ?? []).filter(bySearchProduct);
    if (minN != null || maxN != null) {
      list = list.filter((p) => byPrice(getPrice(p)));
    }
    return [...list].sort((a, b) => getPrice(a) - getPrice(b));
  }, [productsByCategoryName, search, minN, maxN]);

  /** Category cards: product categories only (HBF Deals has its own section below) */
  const categoryCards = useMemo(
    () =>
      uniqueCategories.map((c) => ({
        key: c.id,
        label: c.name,
        imageUrl: categoryImageMap[c.id] ?? null,
      })),
    [uniqueCategories, categoryImageMap]
  );

  const handleSearchBlur = () => {
    if (search.trim()) addRecentSearch(search.trim());
    setRecentSearches(getRecentSearches());
  };

  return (
    <div className="max-w-4xl mx-auto flex-1 min-h-0 menu-scroll-root w-full min-w-0 overflow-x-hidden px-3 sm:px-5">
      <div className="space-y-4 pb-4">
        {/* Open/Closed + Happy Hour Banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl ${
            isOpen
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {isOpen ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-bold ${isOpen ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {isOpen ? "We're Open" : "We're Closed"}
            </p>
            <p className={`text-sm ${isOpen ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {isOpen ? `Open ${openTime} – ${closeTime}` : `Open ${openTime} – ${closeTime}. Browse menu; order when open.`}
            </p>
            {isHappyHour && (
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mt-1">
                🎉 Happy Hour {happyHourStart}–{happyHourEnd}: {happyHourDiscount}% off!
              </p>
            )}
          </div>
        </div>

        {/* Delivery / Pickup - improved design */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-soft">
          <div className="bg-gradient-to-r from-primary/5 to-accent/10 dark:from-primary/10 dark:to-accent/20 p-3">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                onClick={() => setDeliveryMode('delivery' as const)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all tap-highlight ${
                  deliveryMode === 'delivery'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🚚 Delivery
              </button>
              <button
                onClick={() => setDeliveryMode('pickup' as const)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all tap-highlight ${
                  deliveryMode === 'pickup' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🏪 Pickup
              </button>
            </div>
          </div>
        </div>

        {/* Happy Hour Deals: 3-5pm 10% off, after midnight 10% on Hot Wings, B.B.Q Grilled Burger, Broast Full */}
        {showHappyHourDeals && happyHourProducts.length > 0 && (
          <div id="section-happy-hour" className="scroll-mt-4">
            <h2 className="font-bold text-lg mb-1 text-slate-800 dark:text-slate-100 tracking-tight">Happy Hour Deals</h2>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3 font-medium">
              {isHappyHour ? `${happyHourStart}–${happyHourEnd}: ${happyHourDiscount}% off` : isAfterMidnight ? `After midnight: ${happyHourDiscount}% off` : ''} on selected items
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {happyHourProducts.map((product) => (
                <div key={product.id} className="min-h-0">
                  <ProductCard product={product} discountPercent={happyHourDiscount} />
                </div>
              ))}
            </div>
          </div>
        )}

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
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100 tracking-tight">
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

        {/* Categories: mobile flex-wrap (touch scroll works), desktop horizontal scroll */}
        <div className="w-full min-w-0">
          <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 tracking-tight">Categories</h2>
          <div className="flex flex-wrap gap-4 sm:gap-5 sm:hidden justify-center">
            {categoryCards.map(({ key, label, imageUrl }) => (
              <button
                key={key}
                type="button"
                onClick={() => scrollToSection(`section-${key}`)}
                className="flex flex-col items-center gap-3 tap-highlight text-left w-24"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-category-pop flex-shrink-0 image-pop ring-1 ring-slate-200/50 dark:ring-slate-600/50">
                  <FoodImage
                    src={imageUrl}
                    alt={label}
                    aspect="1:1"
                    sizes="96px"
                    className="w-full h-full"
                  />
                </div>
                <span className="category-label-pill text-xs font-semibold px-3 py-1.5 rounded-full line-clamp-2 text-center max-w-full">
                  {label}
                </span>
              </button>
            ))}
          </div>
          <HorizontalScrollStrip className="hidden sm:flex gap-5 pb-2 px-1 scrollbar-visible overscroll-x-contain min-w-0 w-full horizontal-scroll-strip">
            {categoryCards.map(({ key, label, imageUrl }) => (
              <button
                key={key}
                type="button"
                onClick={() => scrollToSection(`section-${key}`)}
                className="flex-shrink-0 flex flex-col items-center gap-3 tap-highlight text-left scroll-snap-item hover-scale-subtle scroll-strip-card"
              >
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-category-pop ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-primary/30 flex-shrink-0 image-pop">
                  <FoodImage
                    src={imageUrl}
                    alt={label}
                    aspect="1:1"
                    sizes="112px"
                    className="w-full h-full"
                  />
                </div>
                <span className="category-label-pill text-xs font-semibold px-3 py-1.5 rounded-full line-clamp-2 text-center max-w-[7rem]">
                  {label}
                </span>
              </button>
            ))}
          </HorizontalScrollStrip>
        </div>

        {/* HBF Deals: mobile grid (touch scroll works), desktop horizontal scroll */}
        {(hbfDealsProducts.length > 0 || filteredAllDeals.length > 0) && (
          <div id="section-hbf-deals" className="scroll-mt-4">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-100 tracking-tight">HBF Deals</h2>
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {hbfDealsProducts.map((product) => (
                <div key={product.id} className="min-h-0">
                  <ProductCard product={product} />
                </div>
              ))}
              {filteredAllDeals.map((deal) => (
                <div key={deal.id} className="min-h-0">
                  <DealCard deal={deal} grid />
                </div>
              ))}
            </div>
            <HorizontalScrollStrip className="hidden sm:flex gap-4 pb-2 px-1 scrollbar-visible overscroll-x-contain min-w-0 w-full horizontal-scroll-strip">
              {hbfDealsProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-44 min-h-[304px] scroll-snap-item hover-scale-subtle scroll-strip-card">
                  <ProductCard product={product} />
                </div>
              ))}
              {filteredAllDeals.map((deal) => (
                <div key={deal.id} className="flex-shrink-0 w-44 min-h-[304px] scroll-snap-item hover-scale-subtle scroll-strip-card">
                  <DealCard deal={deal} grid />
                </div>
              ))}
            </HorizontalScrollStrip>
          </div>
        )}

        {catsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-3" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="flex-shrink-0 w-44 aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {uniqueCategories.map((cat) => {
              const list = filteredProductsByCategory[cat.id] ?? [];
              return (
                <div key={cat.id}>
                  {list.length > 0 && (
                    <div id={`section-${cat.id}`} className="scroll-mt-4">
                      <h2 className="font-bold text-lg mb-3">
                        <span className="category-label-pill inline-block px-4 py-2 rounded-xl font-semibold text-base">
                          {cat.name}
                        </span>
                      </h2>
                      {/* Mobile: 2-col grid fills width. Desktop: horizontal scroll */}
                      <div className="grid grid-cols-2 gap-3 sm:hidden">
                        {list.map((product) => (
                          <div key={product.id} className="min-h-0">
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                      <HorizontalScrollStrip className="hidden sm:flex gap-4 pb-2 px-1 scrollbar-visible overscroll-x-contain min-w-0 w-full horizontal-scroll-strip">
                        {list.map((product) => (
                          <div
                            key={product.id}
                            className="flex-shrink-0 w-44 min-h-[304px] scroll-snap-item hover-scale-subtle scroll-strip-card"
                          >
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </HorizontalScrollStrip>
                    </div>
                  )}
                </div>
              );
            })}
            {uniqueCategories.length > 0 &&
              uniqueCategories.every(
                (c) => (filteredProductsByCategory[c.id] ?? []).length === 0
              ) &&
              hbfDealsProducts.length === 0 &&
              filteredAllDeals.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No products or deals match your filters.</p>
                  <Link
                    href="/admin"
                    className="hidden md:inline-block text-primary underline mt-2"
                  >
                    Go to Admin to add menu
                  </Link>
                </div>
              )}
          </>
        )}

        <ReviewsSection />
      </div>
    </div>
  );
}
