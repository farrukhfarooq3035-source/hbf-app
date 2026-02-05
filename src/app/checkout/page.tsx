'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { hapticMedium } from '@/lib/haptic';
import { RippleButton } from '@/components/customer/RippleButton';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Clock, RefreshCw } from 'lucide-react';

interface Zone { id: string; name: string; min_order: number; delivery_fee: number; free_above: number | null }

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, getSubtotal, getDeliveryFee, getGrandTotal, getDistanceKm, getEstimatedDeliveryMinutes, clearCart, setUserLocation } = useCartStore();
  const { isOpen, openTime, closeTime, isHappyHour, happyHourDiscount } = useBusinessHours();
  const estMins = getEstimatedDeliveryMinutes();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [firstOrderDiscount, setFirstOrderDiscount] = useState<{ discount: number; message: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshingLocation, setRefreshingLocation] = useState(false);

  const subtotal = getSubtotal();
  const geoDeliveryFee = getDeliveryFee();
  const matchedZone = address.trim() ? zones.find((z) => address.toLowerCase().includes(z.name.toLowerCase())) : null;
  const distanceKm = getDistanceKm();
  const freeDeliveryUnder5Km = distanceKm != null && distanceKm <= 5;
  // When we have location: always use geo-based fee (zone does NOT override). Zone only when no location.
  let deliveryFee: number;
  if (distanceKm != null) {
    deliveryFee = geoDeliveryFee; // 0 if ≤5 km, else (km-5)*30
  } else if (matchedZone) {
    deliveryFee = matchedZone.free_above != null && subtotal >= matchedZone.free_above ? 0 : (matchedZone.delivery_fee ?? 0);
  } else {
    deliveryFee = 0;
  }
  if (freeDeliveryUnder5Km) deliveryFee = 0;
  const ONLINE_DELIVERY_MIN = 500;
  const minOrder = Math.max(matchedZone?.min_order ?? 0, ONLINE_DELIVERY_MIN);
  const promoDiscount = appliedPromo?.discount ?? 0;
  const firstOrder = firstOrderDiscount?.discount ?? 0;
  const happyHourAmount = isHappyHour ? Math.round((subtotal * happyHourDiscount) / 100) : 0;
  const discount = Math.max(promoDiscount, firstOrder, happyHourAmount);
  const taxAmount = 0; // Placeholder until tax logic is wired
  const total = Math.max(0, subtotal + deliveryFee - discount);

  useEffect(() => {
    fetch('/api/zones')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=' + encodeURIComponent('/checkout'));
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.replace('/menu');
    }
  }, [items.length, loading, router]);

  useEffect(() => {
    if (!user?.id || subtotal <= 0) {
      setFirstOrderDiscount(null);
      return;
    }
    fetch(`/api/promo/first-order?user_id=${encodeURIComponent(user.id)}&subtotal=${subtotal}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid && data.discount > 0) {
          setFirstOrderDiscount({ discount: data.discount, message: data.message || 'First order discount' });
        } else {
          setFirstOrderDiscount(null);
        }
      })
      .catch(() => setFirstOrderDiscount(null));
  }, [user?.id, subtotal]);

  const applyPromo = () => {
    setPromoError('');
    if (!promoCode.trim()) return;
    fetch(`/api/promo/validate?code=${encodeURIComponent(promoCode.trim())}&subtotal=${subtotal}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setAppliedPromo({ id: data.promo_id, code: data.code, discount: data.discount });
        } else {
          setPromoError(data.error || 'Invalid code');
        }
      })
      .catch(() => setPromoError('Could not validate'));
  };

  const refreshLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
    setRefreshingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
        setRefreshingLocation(false);
      },
      () => setRefreshingLocation(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticMedium();
    setError('');
    if (!isOpen) {
      setError(`We're closed. Open ${openTime} – ${closeTime}.`);
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (minOrder > 0 && subtotal < minOrder) {
      setError(`Minimum order for your area is Rs ${minOrder}/-.`);
      return;
    }

    setLoading(true);
    try {
      const distanceKm = getDistanceKm();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          customer_name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim() || null,
          total_price: total,
          status: 'new',
          distance_km: distanceKm ?? null,
          discount_amount: discount,
          promo_code_id: appliedPromo?.id || null,
          delivery_zone_id: matchedZone?.id || null,
          order_channel: 'online',
          service_mode: 'delivery',
          sub_total: subtotal,
          delivery_fee: deliveryFee,
          tax_amount: taxAmount,
          amount_due: total,
          amount_paid: 0,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      for (const item of items) {
        let itemName = item.name;
        if (item.size) itemName += ` (${item.size})`;
        if (item.addons?.length) itemName += ` + ${item.addons.join(', ')}`;
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.product_id || null,
          deal_id: item.deal_id || null,
          qty: item.qty,
          price: item.price,
          item_name: itemName,
        });
      }

      if (appliedPromo?.id) {
        await fetch('/api/promo/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promo_id: appliedPromo.id }),
        });
      }
      setFirstOrderDiscount(null);

      clearCart();
      router.push(`/order/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto pb-8">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        {!isOpen && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 dark:text-amber-200 font-medium">
              We&apos;re closed. Open {openTime} – {closeTime}. Order when we&apos;re open.
            </p>
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {items.length} items • Subtotal Rs {subtotal}/-
        </p>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-3">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            📍 Delivery charges: Free within 5 km • Rs 30 per km beyond 5 km
          </p>
          {distanceKm != null && (
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              You&apos;re {distanceKm.toFixed(1)} km away
              {distanceKm > 5 && ` • Rs ${deliveryFee}/- delivery fee`}
            </p>
          )}
          {distanceKm != null && (
            <button
              type="button"
              onClick={refreshLocation}
              disabled={refreshingLocation}
              className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingLocation ? 'animate-spin' : ''}`} />
              {refreshingLocation ? 'Updating...' : 'Wrong distance? Refresh location'}
            </button>
          )}
        </div>
        {freeDeliveryUnder5Km && (
          <p className="text-green-600 dark:text-green-400 text-sm mb-2">
            Free delivery (within 5 km)
          </p>
        )}
        {deliveryFee > 0 && (
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Delivery fee: Rs {deliveryFee}/-
          </p>
        )}
        {matchedZone && matchedZone.free_above != null && subtotal < matchedZone.free_above && !freeDeliveryUnder5Km && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Free delivery on orders above Rs {matchedZone.free_above}/-
          </p>
        )}
        {minOrder > 0 && subtotal < minOrder && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
            Min order for your area: Rs {minOrder}/-
          </p>
        )}
        {discount > 0 && (
          <p className="text-green-600 dark:text-green-400 text-sm mb-2">
            {appliedPromo?.discount === discount
              ? `Promo ${appliedPromo.code}`
              : happyHourAmount === discount
                ? `Happy Hour ${happyHourDiscount}% off`
                : firstOrderDiscount?.message || 'Discount'}: -Rs {discount}/-
          </p>
        )}
        {estMins != null && (
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Estimated delivery: ~{estMins} min
          </p>
        )}
        <p className="font-semibold text-primary mb-6">
          Total: Rs {total}/-
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
            <button type="button" onClick={applyPromo} className="px-4 py-2 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5">
              Apply
            </button>
          </div>
          {promoError && <p className="text-sm text-red-600">{promoError}</p>}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Delivery Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, area, city"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Order Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call on arrival"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Free delivery within 5 km • Rs 30 per km beyond 5 km
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-2">
              Payment: Cash on Delivery (COD)
            </p>
            <RippleButton
              type="submit"
              disabled={loading || !isOpen || (minOrder > 0 && subtotal < minOrder)}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : !isOpen ? `Closed - Open ${openTime}` : `Place Order - Rs ${total}/-`}
            </RippleButton>
          </div>
        </form>
      </div>
    </div>
  );
}
