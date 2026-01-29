'use client';

import { useState, useEffect } from 'react';
import { getStorePhone, DEFAULT_STORE_PHONE_DISPLAY } from '@/lib/store-config';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminSettingsPage() {
  const storePhone = getStorePhone() || DEFAULT_STORE_PHONE_DISPLAY;
  const isFromEnv = !!getStorePhone();
  const [openTime, setOpenTime] = useState('11:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/business')
      .then((res) => res.ok ? res.json() : {})
      .then((data) => {
        if (data.open_time) setOpenTime(String(data.open_time));
        if (data.close_time) setCloseTime(String(data.close_time));
        if (Array.isArray(data.closed_days)) setClosedDays(data.closed_days);
      })
      .catch(() => {});
  }, []);

  const saveBusinessHours = () => {
    setSaving(true);
    setSaved(false);
    fetch('/api/settings/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open_time: openTime, close_time: closeTime, closed_days: closedDays }),
    })
      .then((res) => {
        if (res.ok) setSaved(true);
      })
      .finally(() => setSaving(false));
  };

  const toggleClosedDay = (day: number) => {
    setClosedDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day].sort()));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl mb-6">
        <h2 className="font-semibold mb-4">Business Hours</h2>
        <p className="text-gray-600 text-sm mb-4">
          Customer app will show &quot;We&apos;re closed&quot; outside these hours and on closed days.
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Open</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Close</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Closed days</label>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleClosedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  closedDays.includes(day) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {DAY_NAMES[day]}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={saveBusinessHours}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && <span className="ml-2 text-green-600 text-sm">Saved</span>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Contact Info</h2>
        <p className="text-gray-600 text-sm mb-4">
          Store phone is used for &quot;Call store&quot; on the customer order tracking page. Set{' '}
          <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_STORE_PHONE</code> in .env.local (e.g. 03001234567).
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-medium">Phone:</span> {storePhone}
            {!isFromEnv && (
              <span className="ml-2 text-amber-600 text-xs">(default — set env to override)</span>
            )}
          </li>
          <li>
            <span className="font-medium">Location:</span> Near Pak Arab
            Society, Opp Awan Market
          </li>
          <li>
            <span className="font-medium">Social:</span> @haqbahoofoodshbf
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl mt-6">
        <h2 className="font-semibold mb-4">Environment</h2>
        <p className="text-gray-600 text-sm">
          Ensure these are set in .env.local:
        </p>
        <ul className="mt-2 space-y-1 text-sm font-mono">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>SUPABASE_SERVICE_ROLE_KEY</li>
          <li>NEXT_PUBLIC_STORE_PHONE (optional — for Call store)</li>
        </ul>
      </div>
    </div>
  );
}
