import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('business_settings')
    .select('key, value');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const map: Record<string, unknown> = {};
  (data || []).forEach((r) => {
    map[r.key] = r.value;
  });
  return NextResponse.json(map);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { open_time, close_time, closed_days, happy_hour_start, happy_hour_end, happy_hour_discount } = body;
  const updates: { key: string; value: unknown }[] = [];
  if (typeof open_time === 'string') updates.push({ key: 'open_time', value: open_time });
  if (typeof close_time === 'string') updates.push({ key: 'close_time', value: close_time });
  if (Array.isArray(closed_days)) updates.push({ key: 'closed_days', value: closed_days });
  if (typeof happy_hour_start === 'string') updates.push({ key: 'happy_hour_start', value: happy_hour_start });
  if (typeof happy_hour_end === 'string') updates.push({ key: 'happy_hour_end', value: happy_hour_end });
  if (typeof happy_hour_discount === 'number') updates.push({ key: 'happy_hour_discount', value: happy_hour_discount });
  for (const u of updates) {
    const { error } = await supabaseAdmin
      .from('business_settings')
      .upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
