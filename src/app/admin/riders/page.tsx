'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, MapPin, Key, Package } from 'lucide-react';
import { RiderMap } from '@/components/RiderMap';
import { STORE_LAT, STORE_LNG } from '@/lib/geo';

export default function AdminRidersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [trackRiderId, setTrackRiderId] = useState<string | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pinRiderId, setPinRiderId] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState('');

  const { data: riders, isLoading } = useQuery({
    queryKey: ['riders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: ordersForCount } = useQuery({
    queryKey: ['orders-rider-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('rider_id');
      if (error) throw error;
      return data as { rider_id: string | null }[];
    },
  });

  const orderCountByRider = useMemo(() => {
    const list = ordersForCount ?? [];
    return list.reduce((acc, o) => {
      if (o.rider_id) acc[o.rider_id] = (acc[o.rider_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [ordersForCount]);

  const createRider = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const { error } = await supabase.from('riders').insert({
        name: data.name,
        phone: data.phone,
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      setForm({ name: '', phone: '' });
    },
  });

  const deleteRider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('riders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riders'] }),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'active' | 'inactive';
    }) => {
      const { error } = await supabase
        .from('riders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riders'] }),
  });

  const updatePin = useMutation({
    mutationFn: async ({ id, pin }: { id: string; pin: string }) => {
      const { error } = await supabase
        .from('riders')
        .update({ pin: pin.trim() || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      setPinRiderId(null);
      setPinValue('');
    },
  });

  const openPinModal = (r: { id: string; pin?: string | null }) => {
    setPinRiderId(r.id);
    setPinValue(r.pin ?? '');
  };

  const openTrack = (riderId: string) => {
    setTrackRiderId(riderId);
    setRiderLocation(null);
    fetch(`/api/riders/${riderId}/location`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.lat != null && data?.lng != null) {
          setRiderLocation({ lat: data.lat, lng: data.lng });
        }
      })
      .catch(() => {});
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Riders</h1>
      <p className="text-sm text-gray-800 mb-6">
        Set <strong>PIN</strong> for rider app login (<strong>/rider/login</strong>). Track location (map icon) to see rider on map. Rider logs in at <strong>/rider/login</strong> then uses <strong>/rider</strong> for deliveries &amp; location.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Rider</h2>
        <div className="flex gap-4 flex-wrap">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <button
            onClick={() => createRider.mutate(form)}
            disabled={!form.name || !form.phone}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">PIN</th>
                <th className="text-left p-4">Orders</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders?.map((r) => (
                <tr key={r.id} className="border-t dark:border-gray-700">
                  <td className="p-4 font-medium text-gray-900 ">{r.name}</td>
                  <td className="p-4 text-gray-800">{r.phone}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => openPinModal(r)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      title="Set or change PIN"
                    >
                      <Key className="w-3.5 h-3.5" />
                      {r.pin ? '••••' : 'Set'}
                    </button>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/orders?rider_id=${r.id}`}
                      className="flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <Package className="w-4 h-4" />
                      {orderCountByRider[r.id] ?? 0}
                    </Link>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        toggleStatus.mutate({
                          id: r.id,
                          status: r.status === 'active' ? 'inactive' : 'active',
                        })
                      }
                      className={`px-3 py-1 rounded-lg text-sm ${
                        r.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 '
                      }`}
                    >
                      {r.status}
                    </button>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={() => openTrack(r.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                      title="Track location"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRider.mutate(r.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!riders?.length && !isLoading && (
          <div className="p-12 text-center text-gray-800">No riders yet.</div>
        )}
      </div>

      {trackRiderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 ">Rider location</h3>
              <button
                type="button"
                onClick={() => { setTrackRiderId(null); setRiderLocation(null); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ×
              </button>
            </div>
            {riderLocation ? (
              <RiderMap
                storeLat={STORE_LAT}
                storeLng={STORE_LNG}
                riderLat={riderLocation.lat}
                riderLng={riderLocation.lng}
                height={280}
              />
            ) : (
              <p className="text-gray-800 py-8 text-center">
                No location yet. Rider can share location from the Rider page.
              </p>
            )}
            <p className="text-xs text-gray-800 mt-2">
              Rider login: /rider/login → then /rider for deliveries &amp; location
            </p>
          </div>
        </div>
      )}

      {pinRiderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-lg text-gray-900  mb-4">Rider PIN</h3>
            <p className="text-sm text-gray-800 mb-3">
              PIN is used for rider app login at /rider/login. 4–6 digits recommended.
            </p>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 mb-4"
              maxLength={8}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updatePin.mutate({ id: pinRiderId, pin: pinValue })}
                disabled={updatePin.isPending}
                className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {updatePin.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setPinRiderId(null); setPinValue(''); }}
                className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-900 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
