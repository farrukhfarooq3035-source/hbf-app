'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category, Product, Deal } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Category[];
    },
  });
}

/** Menu page: categories with HBF Deals & Top Sale excluded (server-side filter) */
export function useMenuCategories() {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const res = await fetch('/api/menu/categories', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as Category[];
    },
  });
}

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, deal_items(*)')
        .eq('is_active', true);
      if (error) throw error;
      return data as (Deal & { deal_items?: { product_id: string; qty: number }[] })[];
    },
  });
}

/** Top N products by quantity sold (from order_items). Returns [] if RPC missing or no sales. */
export function useTopSellingProducts(limit = 5) {
  return useQuery({
    queryKey: ['top-selling-products', limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_selling_products', {
          lim: limit,
        });
        if (error || !data?.length) return [] as Product[];
        return (data as Product[]).slice(0, limit);
      } catch {
        return [] as Product[];
      }
    },
    retry: false,
  });
}

/** Top N deals by quantity sold (from order_items). Returns [] if RPC missing or no sales — no throw, no retry. */
export function useTopSellingDeals(limit = 12) {
  return useQuery({
    queryKey: ['top-selling-deals', limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_selling_deals', {
          lim: limit,
        });
        if (error || !data?.length) return [] as Deal[];
        return (data as Deal[]).slice(0, limit);
      } catch {
        return [] as Deal[];
      }
    },
    retry: false,
  });
}

export function useDeal(id: string | null) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('deals')
        .select('*, deal_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
