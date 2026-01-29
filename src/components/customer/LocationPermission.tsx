'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

const CUSTOMER_ROUTES = ['/menu', '/cart', '/checkout'];

/** Geolocation works only on HTTPS or localhost. HTTP (e.g. http://IP:3000 on mobile) is blocked by browser. */
function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext;
}

export function LocationPermission() {
  const pathname = usePathname();
  const { locationAllowed, setUserLocation, setLocationDenied } = useCartStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = pathname.startsWith('/admin');
  const isCustomerRoute = CUSTOMER_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
  const secure = isSecureContext();

  useEffect(() => {
    if (
      !isAdmin &&
      isCustomerRoute &&
      locationAllowed === null &&
      typeof navigator !== 'undefined' &&
      'geolocation' in navigator
    ) {
      setShow(true);
    }
  }, [locationAllowed, isCustomerRoute, isAdmin]);

  const handleAllow = () => {
    if (!secure) {
      setLocationDenied();
      setShow(false);
      return;
    }
    setError('');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
        setShow(false);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Location access failed');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDeny = () => {
    setLocationDenied();
    setShow(false);
  };

  if (!show || isAdmin) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-dark mb-2">Location Required</h2>
        {secure ? (
          <>
            <p className="text-gray-600 text-sm mb-4">
              For delivery we need your location. Within 5 km delivery is free; beyond 5 km, Rs 30 per km is charged.
            </p>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeny}
                className="flex-1 py-3 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
              >
                Not Now
              </button>
              <button
                type="button"
                onClick={handleAllow}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Getting location...' : 'Turn On Location'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-4">
              Location works only on a secure connection (HTTPS). You can continue without location — delivery fee will be applied at checkout.
            </p>
            <button
              type="button"
              onClick={handleDeny}
              className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-red-700"
            >
              Continue without location
            </button>
          </>
        )}
      </div>
    </div>
  );
}
