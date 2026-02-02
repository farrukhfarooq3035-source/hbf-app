import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** GET /api/happy-hour - List Happy Hour product IDs (public, for menu display) */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('happy_hour_products')
    .select('product_id, sort_order')
    .order('sort_order');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const productIds = (data || []).map((r) => r.product_id);
  return NextResponse.json({ productIds, items: data || [] });
}

/** POST /api/happy-hour - Set Happy Hour products (admin). Body: { productIds: string[] } */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const productIds = Array.isArray(body.productIds) ? body.productIds : [];
    const ids = productIds.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

    const { data: existing } = await supabaseAdmin.from('happy_hour_products').select('id');
    if (existing?.length) {
      const { error: delError } = await supabaseAdmin
        .from('happy_hour_products')
        .delete()
        .in('id', existing.map((r) => r.id));
      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 500 });
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, productIds: [] });
    }

    const rows = ids.map((product_id: string, i: number) => ({ product_id, sort_order: i }));
    const { error: insError } = await supabaseAdmin
      .from('happy_hour_products')
      .insert(rows);
    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, productIds: ids });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update Happy Hour products' },
      { status: 500 }
    );
  }
}
