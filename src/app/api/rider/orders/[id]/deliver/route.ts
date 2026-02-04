import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const RIDER_COOKIE = 'hbf_rider_id';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const riderId = req.cookies.get(RIDER_COOKIE)?.value;
  if (!riderId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }
  let paymentReceived = false;
  try {
    const body = await req.json().catch(() => ({}));
    paymentReceived = !!body.payment_received;
  } catch {
    // optional body
  }

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, rider_id, status, total_price, amount_paid')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.rider_id !== riderId) {
    return NextResponse.json({ error: 'Not your order' }, { status: 403 });
  }
  if (order.status !== 'on_the_way') {
    return NextResponse.json({ error: 'Order is not on the way' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    status: 'delivered',
    delivered_at: new Date().toISOString(),
  };
  if (paymentReceived) {
    updates.payment_received_at = new Date().toISOString();
    const totalPrice = Number(order.total_price ?? 0);
    const alreadyPaid = Number(order.amount_paid ?? 0);
    if (totalPrice > 0 && alreadyPaid < totalPrice) {
      await supabaseAdmin.from('order_payments').insert({
        order_id: orderId,
        amount: totalPrice - alreadyPaid,
        method: 'cash',
        channel: 'pos',
        notes: 'COD collected by rider',
      });
    }
    if (totalPrice > 0) {
      updates.amount_paid = totalPrice;
      updates.amount_due = 0;
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
