import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const promoId = body.promo_id;
  if (!promoId) {
    return NextResponse.json({ error: 'promo_id required' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .select('used_count')
    .eq('id', promoId)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
  }
  const used = (Number(data.used_count) || 0) + 1;
  const { error: updateError } = await supabaseAdmin
    .from('promo_codes')
    .update({ used_count: used })
    .eq('id', promoId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
