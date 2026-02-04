'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatOrderNumber } from '@/lib/order-utils';

export function NewOrderAlert() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as {
            id: string;
            total_price?: number;
            customer_name?: string;
            order_channel?: string;
            table_number?: string | null;
            token_number?: string | null;
          };
          const orderNum = formatOrderNumber(order.id);
          const total = order.total_price ?? 0;
          const name = order.customer_name ?? 'Customer';
          const channel = order.order_channel ?? 'online';
          const channelLabel =
            channel === 'walk_in'
              ? 'Walk-in POS'
              : channel === 'dine_in'
              ? 'Dine-in'
              : channel === 'takeaway'
              ? 'Takeaway'
              : 'Online';
          const locationHint =
            channel === 'dine_in' && order.table_number
              ? `Table ${order.table_number}`
              : channel === 'walk_in' && order.token_number
              ? `Token ${order.token_number}`
              : '';
          const notificationBody = [channelLabel, `${name} • Rs ${total}/-`, locationHint]
            .filter(Boolean)
            .join(' • ');

          if (Notification.permission === 'granted') {
            new Notification(`New order: ${orderNum}`, {
              body: notificationBody,
              icon: '/logo.png',
              tag: order.id,
            }).onclick = () => {
              window.focus();
              router.push('/admin/orders');
            };
          }

          try {
            if (!audioRef.current) {
              const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
              audio.volume = 0.5;
              audioRef.current = audio;
            }
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
          } catch {
            // fallback: no sound
          }
        }
      )
      .subscribe();

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
