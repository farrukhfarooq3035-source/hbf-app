'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Order, OrderItem, Product } from '@/types';
import { useProducts } from '@/hooks/use-menu';
import { Loader2, PlusCircle, Trash2, X } from 'lucide-react';

interface InvoiceEditorProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  items: OrderItem[];
  onUpdated?: (payload: { order: Partial<Order>; items: OrderItem[] }) => void;
}

interface EditableRow {
  id?: string;
  product_id?: string | null;
  deal_id?: string | null;
  name: string;
  qty: number;
  price: number;
}

function toEditableRows(items: OrderItem[]): EditableRow[] {
  return items.map((item) => ({
    id: item.id,
    product_id: item.product_id,
    deal_id: item.deal_id,
    name: item.item_name || '',
    qty: item.qty,
    price: item.price,
  }));
}

export function InvoiceEditor({ open, onClose, order, items, onUpdated }: InvoiceEditorProps) {
  const [rows, setRows] = useState<EditableRow[]>(toEditableRows(items));
  const [discount, setDiscount] = useState<number>(order.discount_amount ?? 0);
  const [tax, setTax] = useState<number>(order.tax_amount ?? 0);
  const [deliveryFee, setDeliveryFee] = useState<number>(order.delivery_fee ?? 0);
  const [productQuery, setProductQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: products } = useProducts(undefined);

  useEffect(() => {
    if (open) {
      setRows(toEditableRows(items));
      setDiscount(order.discount_amount ?? 0);
      setTax(order.tax_amount ?? 0);
      setDeliveryFee(order.delivery_fee ?? 0);
      setProductQuery('');
      setError(null);
    }
  }, [open, items, order.discount_amount, order.tax_amount, order.delivery_fee]);

  const totals = useMemo(() => {
    const subTotal = rows.reduce((sum, row) => sum + row.qty * row.price, 0);
    const totalAfterDiscount = Math.max(subTotal - discount, 0);
    const totalPrice = Math.max(totalAfterDiscount + tax + deliveryFee, 0);
    return { subTotal, totalPrice, totalAfterDiscount };
  }, [rows, discount, tax, deliveryFee]);

  const filteredProducts: Product[] = useMemo(() => {
    if (!products || !productQuery.trim()) return products || [];
    const lower = productQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 8);
  }, [products, productQuery]);

  const updateRow = (index: number, updates: Partial<EditableRow>) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomRow = () => {
    setRows((prev) => [
      ...prev,
      {
        name: '',
        qty: 1,
        price: 0,
      },
    ]);
  };

  const addProductRow = (product: Product) => {
    setRows((prev) => [
      ...prev,
      {
        product_id: product.id,
        deal_id: null,
        name: product.name,
        qty: 1,
        price:
          (Array.isArray(product.size_options) && product.size_options[0]?.price) ||
          product.price ||
          0,
      },
    ]);
  };

  const handleSave = async () => {
    if (!rows.length) {
      setError('At least one item is required.');
      return;
    }
    if (rows.some((row) => row.qty <= 0)) {
      setError('Quantities must be greater than zero.');
      return;
    }
    if (
      rows.some(
        (row) =>
          !row.product_id &&
          (!row.name || row.name.trim().length === 0)
      )
    ) {
      setError('Custom items require a name.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload = {
        items: rows.map((row) => ({
          id: row.id,
          product_id: row.product_id,
          deal_id: row.deal_id,
          name: row.name,
          qty: row.qty,
          price: row.price,
        })),
        discount_amount: discount,
        tax_amount: tax,
        delivery_fee: deliveryFee,
      };

      const response = await fetch(`/api/admin/orders/${order.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update invoice');
      }
      const result = await response.json();
      onUpdated?.(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Invoice</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-5 py-4 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Items</h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={addCustomRow}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-gray-400"
                  type="button"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Custom item
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200">
              <table className="w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, index) => (
                    <tr key={row.id ?? `new-${index}`}>
                      <td className="px-3 py-2">
                        <input
                          value={row.name}
                          onChange={(e) => updateRow(index, { name: e.target.value })}
                          placeholder="Item name"
                          className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          value={row.qty}
                          onChange={(e) =>
                            updateRow(index, { qty: Math.max(1, Number(e.target.value) || 1) })
                          }
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={row.price}
                          onChange={(e) =>
                            updateRow(index, { price: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-700">
                        Rs {(row.qty * row.price).toFixed(0)}/-
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeRow(index)}
                          className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          type="button"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold uppercase text-gray-500">Add from products</p>
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search product..."
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none"
              />
              <div className="mt-2 max-h-40 overflow-y-auto">
                {filteredProducts && filteredProducts.length > 0 ? (
                  <ul className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filteredProducts.map((product) => (
                      <li key={product.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            Rs{' '}
                            {(
                              (Array.isArray(product.size_options) &&
                                product.size_options[0]?.price) ||
                              product.price ||
                              0
                            ).toFixed(0)}
                            /-
                          </p>
                        </div>
                        <button
                          onClick={() => addProductRow(product)}
                          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                          type="button"
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">
                    {products ? 'No products match your search' : 'Loading products...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Summary</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  Rs {totals.subTotal.toFixed(0)}/-
                </span>
              </div>
              <label className="flex items-center justify-between gap-3">
                <span>Discount</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-right focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Tax</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-right focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Delivery fee</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-right focus:border-primary focus:outline-none"
                />
              </label>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-800">
                <span>Total</span>
                <span>Rs {totals.totalPrice.toFixed(0)}/-</span>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                type="button"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save invoice
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 font-medium text-gray-600 hover:border-gray-400"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
