'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Plus, Check, X } from 'lucide-react';
import { format } from 'date-fns';

type Table = { id: string; name: string; capacity: number; sort_order: number };
type Reservation = {
  id: string;
  table_id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  reservation_date: string;
  time_slot: string;
  guest_count: number;
  status: string;
  notes: string | null;
  created_at: string;
  reservation_tables?: { name: string; capacity: number } | null;
};

export default function AdminReservationsPage() {
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [form, setForm] = useState({
    table_id: '',
    customer_name: '',
    phone: '',
    email: '',
    reservation_date: format(new Date(), 'yyyy-MM-dd'),
    time_slot: '19:00',
    guest_count: 2,
    notes: '',
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['reservation-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservation_tables')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as Table[];
    },
  });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', dateFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, reservation_tables(name, capacity)')
        .eq('reservation_date', dateFilter)
        .order('time_slot');
      if (error) throw error;
      return data as Reservation[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: body.table_id,
          customer_name: body.customer_name,
          phone: body.phone,
          email: body.email || null,
          reservation_date: body.reservation_date,
          time_slot: body.time_slot,
          guest_count: body.guest_count,
          notes: body.notes || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setForm({ ...form, table_id: '', customer_name: '', phone: '', email: '', notes: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CalendarDays className="w-7 h-7 text-primary" />
        Reservations
      </h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
        <h2 className="font-semibold mb-2">Tables (11 total)</h2>
        <p className="text-sm text-gray-800">
          6 tables for 6 persons (family), 5 tables for 4 persons.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {tables.map((t) => (
            <span
              key={t.id}
              className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-sm"
            >
              {t.name} ({t.capacity} seats)
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Add reservation</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.table_id || !form.customer_name || !form.phone) return;
              createMutation.mutate(form);
            }}
          >
            <select
              value={form.table_id}
              onChange={(e) => setForm((f) => ({ ...f, table_id: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
              required
            >
              <option value="">Select table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Customer name *"
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
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={form.reservation_date}
                onChange={(e) => setForm((f) => ({ ...f, reservation_date: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
              />
              <input
                type="time"
                value={form.time_slot}
                onChange={(e) => setForm((f) => ({ ...f, time_slot: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
              />
            </div>
            <input
              type="number"
              min={1}
              max={6}
              placeholder="Guests"
              value={form.guest_count}
              onChange={(e) => setForm((f) => ({ ...f, guest_count: Number(e.target.value) || 1 }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
            />
            <input
              type="text"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add reservation
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
            />
          </div>
          {isLoading ? (
            <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ) : reservations.length === 0 ? (
            <p className="text-gray-800 text-sm">No reservations for this date.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-medium">{r.customer_name} · {r.phone}</p>
                    <p className="text-sm text-gray-800">
                      {r.reservation_tables?.name ?? ''} · {r.time_slot} · {r.guest_count} guests
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      r.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      r.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.status}
                    </span>
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus.mutate({ id: r.id, status: 'confirmed' })}
                          className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ id: r.id, status: 'cancelled' })}
                          className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
