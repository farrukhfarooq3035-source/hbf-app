import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.trim().toUpperCase();
  const subtotal = parseFloat(searchParams.get('subtotal') || '0');
  if (!code) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 });
  }
  const { data: promo, error } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();
  if (error || !promo) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired code' }, { status: 200 });
  }
  const now = new Date().toISOString();
  const validFrom = promo.valid_from ? new Date(promo.valid_from).toISOString() : null;
  const validTo = promo.valid_to ? new Date(promo.valid_to).toISOString() : null;
  if (validFrom && now < validFrom) {
    return NextResponse.json({ valid: false, error: 'Code not yet valid' }, { status: 200 });
  }
  if (validTo && now > validTo) {
    return NextResponse.json({ valid: false, error: 'Code expired' }, { status: 200 });
  }
  const minOrder = Number(promo.min_order) || 0;
  if (subtotal < minOrder) {
    return NextResponse.json({ valid: false, error: `Min order Rs ${minOrder}/-` }, { status: 200 });
  }
  const usageLimit = promo.usage_limit;
  const usedCount = Number(promo.used_count) || 0;
  if (usageLimit != null && usedCount >= usageLimit) {
    return NextResponse.json({ valid: false, error: 'Code usage limit reached' }, { status: 200 });
  }
  let discount = 0;
  if (promo.type === 'percent') {
    discount = Math.round((subtotal * Number(promo.value)) / 100);
  } else {
    discount = Math.min(Number(promo.value) || 0, subtotal);
  }
  return NextResponse.json({
    valid: true,
    promo_id: promo.id,
    discount,
    code: promo.code,
  });
}
