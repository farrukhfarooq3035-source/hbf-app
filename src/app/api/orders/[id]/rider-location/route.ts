import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** Returns rider location only for the given order (customer: only their order's rider). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('rider_id, status')
    .eq('id', id)
    .single();
  if (orderError || !order?.rider_id || order.status !== 'on_the_way') {
    return NextResponse.json(
      { error: 'Rider location not available for this order' },
      { status: 404 }
    );
  }
  const [locRes, riderRes] = await Promise.all([
    supabaseAdmin
      .from('rider_locations')
      .select('lat, lng, updated_at')
      .eq('rider_id', order.rider_id)
      .single(),
    supabaseAdmin
      .from('riders')
      .select('name, phone')
      .eq('id', order.rider_id)
      .single(),
  ]);
  const loc = locRes.data;
  const rider = riderRes.data;
  return NextResponse.json({
    lat: loc?.lat ?? null,
    lng: loc?.lng ?? null,
    updated_at: loc?.updated_at ?? null,
    rider_name: rider?.name ?? null,
    rider_phone: rider?.phone ?? null,
  });
}
