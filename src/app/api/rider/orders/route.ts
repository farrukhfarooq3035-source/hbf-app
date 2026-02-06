import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const RIDER_COOKIE = 'hbf_rider_id';

export async function GET(req: NextRequest) {
  const riderId = req.cookies.get(RIDER_COOKIE)?.value;
  if (!riderId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  let query = supabaseAdmin
    .from('orders')
    .select('id, status, total_price, customer_name, address, phone, created_at, delivered_at, payment_method, jazzcash_proof_url')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });

  if (fromDate) {
    query = query.gte('created_at', fromDate);
  }
  if (toDate) {
    query = query.lte('created_at', toDate + 'T23:59:59.999Z');
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
