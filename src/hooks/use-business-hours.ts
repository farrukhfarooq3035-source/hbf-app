'use client';

import { useQuery } from '@tanstack/react-query';

function parseTime(t: string): { h: number; m: number } {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

function isBetween(now: Date, open: string, close: string): boolean {
  const o = parseTime(open);
  const c = parseTime(close);
  const nowM = now.getHours() * 60 + now.getMinutes();
  const openM = o.h * 60 + o.m;
  const closeM = c.h * 60 + c.m;
  if (closeM > openM) return nowM >= openM && nowM < closeM;
  return nowM >= openM || nowM < closeM;
}

export function useBusinessHours() {
  const q = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/business');
      if (!res.ok) return null;
      const data = await res.json();
      return {
        open_time: (data.open_time as string) || '11:00',
        close_time: (data.close_time as string) || '23:00',
        closed_days: (data.closed_days as number[]) || [],
        happy_hour_start: (data.happy_hour_start as string) || '15:00',
        happy_hour_end: (data.happy_hour_end as string) || '17:00',
        happy_hour_discount: (data.happy_hour_discount as number) ?? 20,
      };
    },
    staleTime: 60 * 1000,
  });
  const data = q.data;
  const now = new Date();
  const day = now.getDay();
  const isClosedDay = data?.closed_days?.includes(day) ?? false;
  const isWithinHours = data ? isBetween(now, data.open_time, data.close_time) : true;
  const isOpen = !isClosedDay && isWithinHours;
  const isHappyHour = data?.happy_hour_start && data?.happy_hour_end
    ? isBetween(now, data.happy_hour_start, data.happy_hour_end)
    : false;
  return {
    ...q,
    openTime: data?.open_time ?? '11:00',
    closeTime: data?.close_time ?? '23:00',
    closedDays: data?.closed_days ?? [],
    isOpen,
    isHappyHour,
    happyHourStart: data?.happy_hour_start ?? '15:00',
    happyHourEnd: data?.happy_hour_end ?? '17:00',
    happyHourDiscount: data?.happy_hour_discount ?? 20,
  };
}
