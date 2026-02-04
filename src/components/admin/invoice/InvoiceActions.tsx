'use client';

import type { Order, OrderItem } from '@/types';
import { Printer, Ticket } from 'lucide-react';
import { printInvoice, printReadyTicket } from './print';

interface InvoiceActionsProps {
  order: Order;
  items?: OrderItem[] | null;
}

export function InvoiceActions({ order, items }: InvoiceActionsProps) {
  const safeItems = items ?? order.order_items ?? [];
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => printInvoice(order, safeItems)}
        className="inline-flex items-center gap-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900"
      >
        <Printer className="h-3.5 w-3.5" />
        Print Invoice
      </button>
      <button
        type="button"
        onClick={() => printReadyTicket(order, safeItems)}
        className="inline-flex items-center gap-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900"
      >
        <Ticket className="h-3.5 w-3.5" />
        Ready Ticket
      </button>
    </div>
  );
}
