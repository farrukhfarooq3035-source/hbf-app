import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const tableId = searchParams.get('table_id');
  let query = supabaseAdmin
    .from('reservations')
    .select('*, reservation_tables(name, capacity)')
    .order('reservation_date', { ascending: true })
    .order('time_slot', { ascending: true });
  if (date) query = query.eq('reservation_date', date);
  if (tableId) query = query.eq('table_id', tableId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table_id, customer_name, phone, email, reservation_date, time_slot, guest_count, notes, user_id } = body;
    if (!table_id || !customer_name || !phone || !reservation_date || !time_slot) {
      return NextResponse.json(
        { error: 'table_id, customer_name, phone, reservation_date, time_slot are required' },
        { status: 400 }
      );
    }
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert({
        table_id,
        customer_name: String(customer_name).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() || null : null,
        reservation_date: String(reservation_date),
        time_slot: String(time_slot),
        guest_count: guest_count != null ? Number(guest_count) : 1,
        notes: notes ? String(notes).trim() || null : null,
        user_id: user_id || null,
        status: 'pending',
      })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
