'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useCustomerOrders } from '@/hooks/use-customer-orders';
import { formatOrderNumber } from '@/lib/order-utils';
import { Package, Clock } from 'lucide-react';
import type { OrderStatus } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  on_the_way: 'On the way',
  delivered: 'Delivered',
};

function getEtaMins(status: OrderStatus): number {
  switch (status) {
    case 'new': return 28;
    case 'preparing': return 20;
    case 'ready': return 12;
    case 'on_the_way': return 10;
    default: return 0;
  }
}

export function ActiveOrderCard() {
  const { user } = useAuth();
  const { data: orders = [] } = useCustomerOrders(user?.id ?? null);
  const activeOrder = orders.find((o) =>
    ['new', 'preparing', 'ready', 'on_the_way'].includes(o.status)
  );

  if (!user || !activeOrder) return null;

  const status = activeOrder.status as OrderStatus;
  const eta = getEtaMins(status);
  const label = STATUS_LABELS[status] || status;

  return (
    <Link
      href={`/order/${activeOrder.id}`}
      className="w-full max-w-sm block rounded-2xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 shadow-soft tap-highlight hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-dark dark:text-white">
            {formatOrderNumber(activeOrder.id)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Status: {label}
          </p>
          <p className="text-sm font-medium text-primary mt-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            ~{eta} min (estimated)
          </p>
        </div>
        <span className="text-sm font-semibold text-primary flex-shrink-0">Track →</span>
      </div>
    </Link>
  );
}
