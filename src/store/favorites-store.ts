import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  productIds: string[];
  dealIds: string[];
  toggleProduct: (id: string) => void;
  toggleDeal: (id: string) => void;
  isProductFavorite: (id: string) => boolean;
  isDealFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      productIds: [],
      dealIds: [],
      toggleProduct: (id) =>
        set((s) => ({
          productIds: s.productIds.includes(id)
            ? s.productIds.filter((x) => x !== id)
            : [...s.productIds, id],
        })),
      toggleDeal: (id) =>
        set((s) => ({
          dealIds: s.dealIds.includes(id)
            ? s.dealIds.filter((x) => x !== id)
            : [...s.dealIds, id],
        })),
      isProductFavorite: (id) => get().productIds.includes(id),
      isDealFavorite: (id) => get().dealIds.includes(id),
    }),
    { name: 'hbf-favorites' }
  )
);
