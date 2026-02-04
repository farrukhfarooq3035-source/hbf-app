'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCustomerOrders } from '@/hooks/use-customer-orders';
import { formatOrderNumber } from '@/lib/order-utils';
import { Package } from 'lucide-react';
import type { OrderStatus } from '@/types';

const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  order_on_table: 'Order on table',
  closed: 'Closed',
};

/** Rough ETA (mins) from now by status */
function getEtaMins(status: OrderStatus): number {
  switch (status) {
    case 'new': return 28;
    case 'preparing': return 20;
    case 'ready': return 12;
    case 'on_the_way': return 10;
    default: return 0;
  }
}

export function LiveOrderButton() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: orders = [] } = useCustomerOrders(user?.id ?? null);
  const activeOrder = orders.find((o) =>
    ['new', 'preparing', 'ready', 'on_the_way'].includes(o.status)
  );

  if (!activeOrder || !user) return null;
  if (pathname.startsWith('/admin')) return null;
  if (pathname === `/order/${activeOrder.id}`) return null;

  const status = activeOrder.status as OrderStatus;
  const eta = getEtaMins(status);
  const label = STATUS_LABELS[status] || status;

  return (
    <Link
      href={`/order/${activeOrder.id}`}
      className="fixed left-4 right-4 bottom-20 z-40 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg tap-highlight hover:bg-red-700 transition-colors md:left-auto md:right-6 md:max-w-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{formatOrderNumber(activeOrder.id)}</p>
          <p className="text-sm text-white/90 truncate">{label} · ~{eta} min</p>
        </div>
      </div>
      <span className="text-sm font-medium flex-shrink-0">Track →</span>
    </Link>
  );
}
