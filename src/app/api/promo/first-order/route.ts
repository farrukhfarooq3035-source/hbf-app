import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** First order discount: 10-15% for new customers. Set FIRST_ORDER_DISCOUNT_PERCENT in env (default 15). */
const FIRST_ORDER_PERCENT = parseInt(process.env.FIRST_ORDER_DISCOUNT_PERCENT || '15', 10) || 15;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id')?.trim();
  const subtotal = parseFloat(searchParams.get('subtotal') || '0');
  if (!userId || subtotal <= 0) {
    return NextResponse.json({ valid: false, discount: 0 });
  }
  const { count, error } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error || (count ?? 0) > 0) {
    return NextResponse.json({ valid: false, discount: 0 });
  }
  const discount = Math.round((subtotal * Math.min(15, Math.max(10, FIRST_ORDER_PERCENT))) / 100);
  return NextResponse.json({
    valid: true,
    discount: Math.min(discount, subtotal),
    message: `First order! ${Math.min(15, Math.max(10, FIRST_ORDER_PERCENT))}% off applied`,
  });
}
