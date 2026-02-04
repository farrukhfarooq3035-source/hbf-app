import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import {
  STORE_LAT,
  STORE_LNG,
  haversineDistance,
  getDeliveryFeeFromDistance,
} from '@/lib/geo';

interface CartState {
  items: CartItem[];
  deliveryMode: 'delivery' | 'pickup';
  userLocation: { lat: number; lng: number } | null;
  locationAllowed: boolean | null;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  updateItem: (index: number, updates: Partial<Pick<CartItem, 'size' | 'addons' | 'price'>>) => void;
  clearCart: () => void;
  setDeliveryMode: (mode: 'delivery' | 'pickup') => void;
  setUserLocation: (lat: number, lng: number) => void;
  setLocationDenied: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
  getDistanceKm: () => number | null;
  getEstimatedDeliveryMinutes: () => number | null;
  bump: boolean;
  setBump: (v: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryMode: 'delivery',
      userLocation: null,
      locationAllowed: null,
      bump: false,
      setBump: (v) => set({ bump: v }),
      addItem: (item) => {
        const qty = item.qty ?? 1;
        const existing = get().items.findIndex(
          (i) =>
            i.product_id === item.product_id &&
            i.deal_id === item.deal_id &&
            i.size === item.size &&
            JSON.stringify(i.addons) === JSON.stringify(item.addons)
        );
        if (existing >= 0) {
          set((s) => ({
            items: s.items.map((i, idx) =>
              idx === existing ? { ...i, qty: i.qty + qty } : i
            ),
            bump: true,
          }));
        } else {
          set((s) => ({
            items: [...s.items, { ...item, qty }],
            bump: true,
          }));
        }
      },
      removeItem: (index) =>
        set((s) => ({
          items: s.items.filter((_, i) => i !== index),
        })),
      updateQty: (index, qty) => {
        if (qty <= 0) {
          get().removeItem(index);
          return;
        }
        set((s) => ({
          items: s.items.map((i, idx) =>
            idx === index ? { ...i, qty } : i
          ),
        }));
      },
      updateItem: (index, updates) => {
        set((s) => {
          const item = s.items[index];
          if (!item) return s;
          return {
            items: s.items.map((i, idx) =>
              idx === index ? { ...i, ...updates } : i
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      setDeliveryMode: (mode) => set({ deliveryMode: mode }),
      setUserLocation: (lat, lng) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b49ee9de-50a9-4b90-89b0-cd9575d76b4f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart-store.ts:setUserLocation',message:'setUserLocation called',data:{lat,lng,storeLat:STORE_LAT,storeLng:STORE_LNG,km:haversineDistance(STORE_LAT,STORE_LNG,lat,lng)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        set({ userLocation: { lat, lng }, locationAllowed: true });
      },
      setLocationDenied: () => set({ locationAllowed: false }),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      getDeliveryFee: () => {
        const s = get();
        if (s.deliveryMode === 'pickup') return 0;
        if (!s.userLocation) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b49ee9de-50a9-4b90-89b0-cd9575d76b4f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart-store.ts:getDeliveryFee',message:'userLocation is null',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          return 0;
        }
        const km = haversineDistance(
          STORE_LAT,
          STORE_LNG,
          s.userLocation.lat,
          s.userLocation.lng
        );
        const fee = getDeliveryFeeFromDistance(km);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b49ee9de-50a9-4b90-89b0-cd9575d76b4f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart-store.ts:getDeliveryFee',message:'fee computed',data:{userLat:s.userLocation.lat,userLng:s.userLocation.lng,storeLat:STORE_LAT,storeLng:STORE_LNG,km,fee},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H3,H4,H5'})}).catch(()=>{});
        // #endregion
        return fee;
      },
      getGrandTotal: () =>
        get().getSubtotal() + get().getDeliveryFee(),
      getTotal: () => get().getGrandTotal(),
      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
      getDistanceKm: () => {
        const s = get();
        if (!s.userLocation) return null;
        const km = haversineDistance(
          STORE_LAT,
          STORE_LNG,
          s.userLocation.lat,
          s.userLocation.lng
        );
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b49ee9de-50a9-4b90-89b0-cd9575d76b4f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart-store.ts:getDistanceKm',message:'distance computed',data:{userLat:s.userLocation.lat,userLng:s.userLocation.lng,km},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H3,H4'})}).catch(()=>{});
        // #endregion
        return km;
      },
      getEstimatedDeliveryMinutes: () => {
        const s = get();
        if (s.deliveryMode === 'pickup') return 15;
        const km = s.getDistanceKm();
        if (km == null) return null;
        return 20 + Math.round(km * 3);
      },
    }),
    {
      name: 'hbf-cart',
      version: 2,
      partialize: (state) => ({
        items: state.items,
        deliveryMode: state.deliveryMode,
        locationAllowed: state.locationAllowed,
        bump: state.bump,
      }),
      migrate: (persistedState, _version) => {
        const s = persistedState as Record<string, unknown>;
        if (s && 'userLocation' in s) {
          const { userLocation: _, ...rest } = s;
          return rest;
        }
        return s;
      },
    }
  )
);
