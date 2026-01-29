import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: riderId } = await params;
  if (!riderId) {
    return NextResponse.json({ error: 'Rider ID required' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from('rider_locations')
    .select('lat, lng, updated_at')
    .eq('rider_id', riderId)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }
  return NextResponse.json({
    lat: data.lat,
    lng: data.lng,
    updated_at: data.updated_at,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: riderId } = await params;
  if (!riderId) {
    return NextResponse.json({ error: 'Rider ID required' }, { status: 400 });
  }
  let body: { lat?: number; lng?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from('rider_locations')
    .upsert(
      { rider_id: riderId, lat, lng, updated_at: new Date().toISOString() },
      { onConflict: 'rider_id' }
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
