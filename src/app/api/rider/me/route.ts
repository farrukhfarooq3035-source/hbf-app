import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const RIDER_COOKIE = 'hbf_rider_id';

export async function GET(req: NextRequest) {
  const riderId = req.cookies.get(RIDER_COOKIE)?.value;
  if (!riderId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const { data: rider, error } = await supabaseAdmin
    .from('riders')
    .select('id, name, phone')
    .eq('id', riderId)
    .single();
  if (error || !rider) {
    const res = NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    res.cookies.set(RIDER_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  }
  return NextResponse.json(rider);
}
