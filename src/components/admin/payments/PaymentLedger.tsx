'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { OrderPayment } from '@/types';
import { Loader2, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentLedgerProps {
  orderId: string;
  amountPaid?: number | null;
  amountDue?: number | null;
}

function formatCurrency(value: number) {
  return `Rs ${value.toFixed(0)}/-`;
}

export function PaymentLedger({ orderId, amountPaid, amountDue }: PaymentLedgerProps) {
  const [expanded, setExpanded] = useState(false);
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [formAmount, setFormAmount] = useState(Number(amountDue ?? 0));
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?order_id=${orderId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Unable to fetch payments');
      }
      const data = (await res.json()) as OrderPayment[];
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && payments.length === 0 && !loading) {
      loadPayments();
    }
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFormAmount(Number(amountDue ?? 0));
  }, [amountDue]);

  const outstanding = useMemo(() => Math.max(Number(amountDue ?? 0), 0), [amountDue]);
  const paid = useMemo(() => Math.max(Number(amountPaid ?? 0), 0), [amountPaid]);

  const handleAddPayment = async () => {
    setError('');
    if (formAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          amount: formAmount,
          method,
          notes,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to add payment');
      }
      setNotes('');
      setFormAmount(Math.max(outstanding - formAmount, 0));
      await loadPayments();
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-xs text-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-primary" />
          <span>Paid: {formatCurrency(paid)}</span>
          <span className={outstanding > 0 ? 'text-amber-600 font-semibold' : 'text-green-600'}>
            Due: {formatCurrency(outstanding)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-primary hover:underline"
        >
          {expanded ? 'Hide ledger' : 'View ledger'}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payments...
            </div>
          ) : payments.length ? (
            <ul className="space-y-1">
              {payments.map((payment) => (
                <li key={payment.id} className="flex justify-between text-[11px] text-gray-700">
                  <span>
                    {formatCurrency(payment.amount)} • {payment.method}
                    {payment.notes && <em className="text-gray-500"> ({payment.notes})</em>}
                  </span>
                  <span>{format(new Date(payment.paid_at), 'MMM d h:mm a')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-gray-500">No payments recorded yet.</p>
          )}
          <div className="border-t border-gray-200 pt-2 text-[11px] space-y-1">
            <p className="font-semibold text-gray-700">Record payment</p>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={formAmount}
                onChange={(e) => setFormAmount(Number(e.target.value) || 0)}
                className="w-20 rounded border border-gray-200 px-2 py-1 text-right"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="rounded border border-gray-200 px-2 py-1"
              >
                <option value="cash">Cash</option>
                <option value="jazzcash">Jazz Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
                <option value="wallet">Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes / reference"
              className="w-full rounded border border-gray-200 px-2 py-1"
            />
            {error && <p className="text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleAddPayment}
              disabled={submitting}
              className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:border-gray-900 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Add payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
