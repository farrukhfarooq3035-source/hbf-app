import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const RIDER_COOKIE = 'hbf_rider_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rider_id: riderId, pin } = body;
    if (!riderId || pin == null || String(pin).trim() === '') {
      return NextResponse.json({ ok: false, error: 'Rider and PIN required' }, { status: 400 });
    }
    const { data: rider, error } = await supabaseAdmin
      .from('riders')
      .select('id, name, phone, pin, status')
      .eq('id', riderId)
      .single();
    if (error || !rider) {
      return NextResponse.json({ ok: false, error: 'Invalid rider' }, { status: 401 });
    }
    if (rider.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Rider is inactive' }, { status: 403 });
    }
    const expectedPin = rider.pin == null ? '' : String(rider.pin).trim();
    const givenPin = String(pin).trim();
    if (expectedPin !== givenPin) {
      return NextResponse.json({ ok: false, error: 'Wrong PIN' }, { status: 401 });
    }
    const res = NextResponse.json({
      ok: true,
      rider: { id: rider.id, name: rider.name, phone: rider.phone },
    });
    res.cookies.set(RIDER_COOKIE, rider.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
