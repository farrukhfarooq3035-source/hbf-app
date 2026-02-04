import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id');
  if (!orderId) {
    return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from('order_payments')
    .select('id, amount, method, reference, paid_at, notes, channel')
    .eq('order_id', orderId)
    .order('paid_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.order_id;
    const amount = Number(body.amount ?? 0);
    const method = typeof body.method === 'string' ? body.method.trim() || 'cash' : 'cash';
    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from('order_payments').insert({
      order_id: orderId,
      amount,
      method,
      paid_at:
        typeof body.paid_at === 'string' && body.paid_at
          ? new Date(body.paid_at).toISOString()
          : new Date().toISOString(),
      channel: 'pos',
      notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
      reference:
        typeof body.reference === 'string' && body.reference.trim() ? body.reference.trim() : null,
    });
    if (error) {
      throw error;
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to record payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
