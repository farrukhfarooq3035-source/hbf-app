'use client';

import { useMemo, useState } from 'react';
import { useProducts } from '@/hooks/use-menu';
import type { Product } from '@/types';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';

type ServiceType = 'walk_in' | 'dine_in' | 'takeaway';

interface PosCartItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
}

const serviceOptions: { value: ServiceType; label: string; helper: string }[] = [
  { value: 'walk_in', label: 'Walk-in (counter)', helper: 'Customer pays at counter / takeaway immediately' },
  { value: 'dine_in', label: 'Dine-in', helper: 'Serve at table; table number optional' },
  { value: 'takeaway', label: 'Takeaway (delivery/pickup)', helper: 'Package order for pickup or courier' },
];

export function WalkInPOS() {
  const { data: products, isLoading } = useProducts(undefined);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('walk_in');
  const [tableNumber, setTableNumber] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!search.trim()) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const safeDiscount = Math.min(Math.max(discountAmount, 0), subtotal);
  const taxableBase = Math.max(subtotal - safeDiscount, 0);
  const computedTax = Number(((taxableBase * Math.max(taxRate, 0)) / 100).toFixed(2));
  const safeDeliveryFee = Math.max(deliveryFee, 0);
  const total = Number(Math.max(taxableBase + computedTax + safeDeliveryFee, 0).toFixed(2));
  const safeAmountPaid = Math.min(Math.max(amountPaid, 0), total);
  const amountDue = Number(Math.max(total - safeAmountPaid, 0).toFixed(2));

  const addToCart = (product: Product) => {
    if (!product?.id) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product_id === productId ? { ...item, qty: Math.max(item.qty + delta, 0) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const resetForm = () => {
    setCartItems([]);
    setCustomerName('Walk-in Guest');
    setPhone('');
    setAddress('');
    setNotes('');
    setTableNumber('');
    setTokenNumber('');
    setDiscountAmount(0);
    setTaxRate(0);
    setDeliveryFee(0);
    setAmountPaid(0);
    setPaymentMethod('cash');
    setDueDate('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');
    if (!cartItems.length) {
      setError('Add at least one product to the cart.');
      return;
    }
    if (showAddressField && !address.trim()) {
      setError('Address / delivery details are required for takeaway orders.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName?.trim() || 'Walk-in Guest',
        phone: phone?.trim() || null,
        address: address?.trim() || 'On-premise order',
        notes: notes?.trim() || null,
        service_type: serviceType,
        table_number: tableNumber?.trim() || null,
        token_number: tokenNumber?.trim() || null,
        discount_amount: safeDiscount,
        tax_amount: computedTax,
        delivery_fee: safeDeliveryFee,
        sub_total: subtotal,
        total_price: total,
        amount_paid: safeAmountPaid,
        amount_due: amountDue,
        payment_method: paymentMethod,
        due_at: dueDate ? new Date(dueDate).toISOString() : null,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          price: item.price,
          name: item.name,
        })),
      };

      const res = await fetch('/api/admin/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create order');
      }
      const data = await res.json();
      setSuccessMessage(`Walk-in order created (#${data.id.slice(0, 8)})`);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const showAddressField = serviceType === 'takeaway';
  const showTableField = serviceType === 'dine_in';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold">Products</h2>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full max-w-sm rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="rounded-2xl border border-gray-200 p-3 text-left hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Rs {product.price}/-</p>
                </button>
              ))}
              {!filteredProducts.length && (
                <p className="text-sm text-gray-500">No products match “{search}”.</p>
              )}
            </div>
          )}
        </div>

        <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Cart</h2>
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">No items yet. Tap a product to add it.</p>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li key={item.product_id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Rs {item.price}/- × {item.qty} = Rs {(item.price * item.qty).toFixed(0)}/-
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, -1)}
                      className="rounded-full border border-gray-300 p-1 text-gray-600 hover:border-primary hover:text-primary"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, 1)}
                      className="rounded-full border border-gray-300 p-1 text-gray-600 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="rounded-full border border-gray-300 p-1 text-gray-600 hover:border-red-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">Rs {subtotal.toFixed(0)}/-</span>
            </div>
            <label className="flex items-center justify-between gap-3">
              <span>Discount</span>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-28 rounded-xl border border-gray-200 px-2 py-1 text-right"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Tax %</span>
              <input
                type="number"
                min={0}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-28 rounded-xl border border-gray-200 px-2 py-1 text-right"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Delivery / Service fee</span>
              <input
                type="number"
                min={0}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                className="w-28 rounded-xl border border-gray-200 px-2 py-1 text-right"
              />
            </label>
            <div className="flex items-center justify-between font-semibold text-base">
              <span>Total</span>
              <span>Rs {total.toFixed(0)}/-</span>
            </div>
            <label className="flex items-center justify-between gap-3">
              <span>Amount paid</span>
              <input
                type="number"
                min={0}
                max={total}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                className="w-28 rounded-xl border border-gray-200 px-2 py-1 text-right"
              />
            </label>
            <div className="flex items-center justify-between text-sm">
              <span>Amount due</span>
              <span className="font-semibold text-amber-600">Rs {amountDue.toFixed(0)}/-</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Customer & order details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Customer name</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2"
              placeholder="Walk-in Guest"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Phone (optional)</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2"
              placeholder="03XX..."
            />
          </label>
          {showAddressField && (
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              <span>Address / delivery details</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2"
                rows={2}
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2"
              rows={2}
              placeholder="Any kitchen instructions, etc."
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-gray-100 p-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Service type</p>
            <div className="grid gap-2">
              {serviceOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${
                    serviceType === option.value ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={option.value}
                    checked={serviceType === option.value}
                    onChange={() => setServiceType(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.helper}</span>
                  </span>
                </label>
              ))}
            </div>
            {showTableField && (
              <div className="grid gap-3 pt-2 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span>Table #</span>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2"
                    placeholder="A1, Hall 2..."
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Token # (optional)</span>
                  <input
                    type="text"
                    value={tokenNumber}
                    onChange={(e) => setTokenNumber(e.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-gray-100 p-3">
            <p className="text-sm font-medium text-gray-700">Payment details</p>
            <label className="flex flex-col gap-1 text-sm">
              <span>Payment method</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
                <option value="wallet">Wallet</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Due date (optional)</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
            </label>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {successMessage && (
          <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={submitting || cartItems.length === 0}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating order...
              </>
            ) : (
              'Create Walk-in Order'
            )}
          </button>
          <button
            type="button"
            disabled={submitting || cartItems.length === 0}
            onClick={resetForm}
            className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-40"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
