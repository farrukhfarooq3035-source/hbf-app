import { create } from 'zustand';

export interface CompareItem {
  id: string;
  type: 'product' | 'deal';
  imageUrl: string;
  title: string;
}

interface CompareState {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  add: (item) =>
    set((s) => {
      if (s.items.some((i) => i.id === item.id)) return s;
      const next = [...s.items, item].slice(-2);
      return { items: next };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
  has: (id) => get().items.some((i) => i.id === id),
}));
