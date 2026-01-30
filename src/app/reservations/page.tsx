'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, Users } from 'lucide-react';
import { format } from 'date-fns';

type Table = { id: string; name: string; capacity: number };
type Reservation = { table_id: string; time_slot: string }[];

export default function ReservationsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation>([]);
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [form, setForm] = useState({
    table_id: '',
    customer_name: '',
    phone: '',
    email: '',
    time_slot: '19:00',
    guest_count: 2,
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/reservation-tables')
      .then((r) => r.ok ? r.json() : [])
      .then(setTables)
      .catch(() => setTables([]));
  }, []);

  useEffect(() => {
    if (!date) return;
    fetch(`/api/reservations?date=${date}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setReservations)
      .catch(() => setReservations([]));
  }, [date]);

  const bookedSet = new Set(
    reservations.map((r) => `${r.table_id}-${r.time_slot}`)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.table_id || !form.customer_name || !form.phone) return;
    setLoading(true);
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_id: form.table_id,
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email || null,
        reservation_date: date,
        time_slot: form.time_slot,
        guest_count: form.guest_count,
        notes: form.notes || null,
      }),
    })
      .then((r) => {
        if (r.ok) setSubmitted(true);
        else return r.json().then((d) => Promise.reject(d.error));
      })
      .catch((err) => alert(err || 'Failed to book'))
      .finally(() => setLoading(false));
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
          <p className="font-bold text-green-800 dark:text-green-200 text-lg mb-2">Booking request sent</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            We will confirm your table reservation shortly. You can also call the store to confirm.
          </p>
          <Link href="/menu" className="inline-block py-2 px-4 bg-primary text-white font-medium rounded-xl hover:bg-red-700">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-dark dark:text-white">Table reservation</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We have 11 tables: 6 for 6 persons (family) and 5 for 4 persons. Book below.
      </p>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <p className="font-semibold text-dark dark:text-white mb-2 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Tables
        </p>
        <div className="flex flex-wrap gap-2">
          {tables.map((t) => (
            <span
              key={t.id}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
            >
              {t.name} ({t.capacity} seats)
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          value={date}
          min={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
          required
        />
        <select
          value={form.table_id}
          onChange={(e) => setForm((f) => ({ ...f, table_id: e.target.value }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
          required
        >
          <option value="">Select table</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.capacity} persons)</option>
          ))}
        </select>
        <input
          type="time"
          value={form.time_slot}
          onChange={(e) => setForm((f) => ({ ...f, time_slot: e.target.value }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
          required
        />
        <input
          type="text"
          placeholder="Your name *"
          value={form.customer_name}
          onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
          required
        />
        <input
          type="tel"
          placeholder="Phone *"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
          required
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
        />
        <input
          type="number"
          min={1}
          max={6}
          placeholder="Number of guests"
          value={form.guest_count}
          onChange={(e) => setForm((f) => ({ ...f, guest_count: Number(e.target.value) || 1 }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Request reservation'}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/menu" className="text-primary font-medium hover:underline">
          Back to Menu
        </Link>
      </p>
    </div>
  );
}
