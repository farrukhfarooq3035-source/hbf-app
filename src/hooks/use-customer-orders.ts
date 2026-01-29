'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

/** Fetch orders for the logged-in user (by user_id). */
export function useCustomerOrders(userId: string | null) {
  return useQuery({
    queryKey: ['customer-orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Order[];
    },
    enabled: !!userId,
  });
}

/** Fetch a single order; caller must ensure user can only access their own (user_id match). */
export function useCurrentOrder(orderId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['order', orderId, userId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
}
