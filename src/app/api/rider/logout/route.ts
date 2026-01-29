import { NextResponse } from 'next/server';

const RIDER_COOKIE = 'hbf_rider_id';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(RIDER_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
