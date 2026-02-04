'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStorePhone, DEFAULT_STORE_PHONE_DISPLAY, getWhatsAppOrderLink } from '@/lib/store-config';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminSettingsPage() {
  const storePhone = getStorePhone() || DEFAULT_STORE_PHONE_DISPLAY;
  const isFromEnv = !!getStorePhone();
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminSaved, setAdminSaved] = useState(false);
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('01:00');
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [happyHourStart, setHappyHourStart] = useState('15:00');
  const [happyHourEnd, setHappyHourEnd] = useState('17:00');
  const [happyHourDiscount, setHappyHourDiscount] = useState(20);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        fetch('/api/admin/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((r) => r.json())
          .then((d) => setAdminDisplayName(d?.display_name ?? ''))
          .catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    fetch('/api/settings/business')
      .then((res) => res.ok ? res.json() : Promise.resolve({}))
      .then((data: {
        open_time?: string; close_time?: string; closed_days?: number[];
        happy_hour_start?: string; happy_hour_end?: string; happy_hour_discount?: number;
      }) => {
        if (data.open_time) setOpenTime(String(data.open_time));
        if (data.close_time) setCloseTime(String(data.close_time));
        if (Array.isArray(data.closed_days)) setClosedDays(data.closed_days);
        if (data.happy_hour_start) setHappyHourStart(String(data.happy_hour_start));
        if (data.happy_hour_end) setHappyHourEnd(String(data.happy_hour_end));
        if (typeof data.happy_hour_discount === 'number') setHappyHourDiscount(data.happy_hour_discount);
      })
      .catch(() => {});
  }, []);

  const saveBusinessHours = () => {
    setSaving(true);
    setSaved(false);
    fetch('/api/settings/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        open_time: openTime,
        close_time: closeTime,
        closed_days: closedDays,
        happy_hour_start: happyHourStart,
        happy_hour_end: happyHourEnd,
        happy_hour_discount: happyHourDiscount,
      }),
    })
      .then((res) => {
        if (res.ok) setSaved(true);
      })
      .finally(() => setSaving(false));
  };

  const toggleClosedDay = (day: number) => {
    setClosedDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day].sort()));
  };

  const saveAdminProfile = () => {
    setAdminSaving(true);
    setAdminSaved(false);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) {
        setAdminSaving(false);
        return;
      }
      fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ display_name: adminDisplayName }),
      })
        .then((res) => {
          if (res.ok) setAdminSaved(true);
        })
        .finally(() => setAdminSaving(false));
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl mb-6">
        <h2 className="font-semibold mb-4">Business Hours</h2>
        <p className="text-gray-800 text-sm mb-4">
          Customer app will show &quot;We&apos;re closed&quot; outside these hours and on closed days.
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Open</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Close</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Closed days</label>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleClosedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  closedDays.includes(day) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-900'
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

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl mb-6">
        <h2 className="font-semibold mb-4">Admin Profile (Invoice)</h2>
        <p className="text-gray-800 text-sm mb-4">
          Display name shown on invoices as &quot;Generated by&quot;. Set your name (e.g. Admin 1, Farrukh).
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={adminDisplayName}
            onChange={(e) => setAdminDisplayName(e.target.value)}
            placeholder="e.g. Admin 1"
            className="px-3 py-2 rounded-xl border flex-1 max-w-xs"
          />
          <button
            type="button"
            onClick={saveAdminProfile}
            disabled={adminSaving}
            className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {adminSaving ? 'Saving...' : 'Save'}
          </button>
          {adminSaved && <span className="text-green-600 text-sm self-center">Saved</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl mb-6">
        <h2 className="font-semibold mb-4">Time-based Deals (Happy Hour)</h2>
        <p className="text-gray-800 text-sm mb-4">
          Show &quot;Happy Hour X–Y: Z% off&quot; banner when within these hours.
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Start</label>
            <input
              type="time"
              value={happyHourStart}
              onChange={(e) => setHappyHourStart(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">End</label>
            <input
              type="time"
              value={happyHourEnd}
              onChange={(e) => setHappyHourEnd(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Discount %</label>
            <input
              type="number"
              min={5}
              max={50}
              value={happyHourDiscount}
              onChange={(e) => setHappyHourDiscount(parseInt(e.target.value, 10) || 20)}
              className="px-3 py-2 rounded-xl border w-20"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600">Example: 3–5pm, 20% off</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Contact Info</h2>
        <p className="text-gray-800 text-sm mb-4">
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
          {getWhatsAppOrderLink() && (
            <li>
              <span className="font-medium">WhatsApp Order:</span>{' '}
              <a href={getWhatsAppOrderLink()!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Direct order link
              </a>
            </li>
          )}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl mt-6">
        <h2 className="font-semibold mb-4">Environment</h2>
        <p className="text-gray-800 text-sm">
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
