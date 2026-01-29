import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerState {
  phone: string | null;
  name: string | null;
  setCustomer: (phone: string, name?: string) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      phone: null,
      name: null,
      setCustomer: (phone, name) => set({ phone, name: name ?? null }),
      clearCustomer: () => set({ phone: null, name: null }),
    }),
    { name: 'hbf-customer' }
  )
);
