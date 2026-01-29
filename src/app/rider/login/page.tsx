'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Loader2 } from 'lucide-react';

const RIDER_STORAGE_KEY = 'hbf-rider';

export interface RiderSession {
  id: string;
  name: string;
  phone: string;
}

export function getRiderSession(): RiderSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(RIDER_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as RiderSession;
    return data?.id && data?.name ? data : null;
  } catch {
    return null;
  }
}

export function setRiderSession(rider: RiderSession) {
  sessionStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(rider));
}

export function clearRiderSession() {
  sessionStorage.removeItem(RIDER_STORAGE_KEY);
}

export default function RiderLoginPage() {
  const router = useRouter();
  const [riders, setRiders] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [riderId, setRiderId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/riders/list')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRiders(Array.isArray(data) ? data : []))
      .catch(() => setRiders([]));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!riderId || !pin.trim()) {
      setError('Select rider and enter PIN');
      return;
    }
    setLoading(true);
    fetch('/api/rider/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rider_id: riderId, pin: pin.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.rider) {
          setRiderSession(data.rider);
          router.replace('/rider');
        } else {
          setError(data.error || 'Login failed');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Bike className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-dark dark:text-white">Rider Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am</label>
            <select
              value={riderId}
              onChange={(e) => { setRiderId(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-dark dark:text-white"
              required
            >
              <option value="">Select rider</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-dark dark:text-white"
              maxLength={8}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !riderId || !pin.trim()}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          PIN is set by admin. Contact store if you don&apos;t have one.
        </p>
      </div>
    </div>
  );
}
