import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * POST /api/products - Create a product (uses service role, bypasses RLS).
 * Use this from admin so product add works even when RLS blocks anon insert.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, description, category_id } = body as {
      name?: string;
      price?: number;
      description?: string | null;
      category_id?: string | null;
    };

    if (!name || price == null) {
      return NextResponse.json(
        { error: 'name and price are required' },
        { status: 400 }
      );
    }

    const nameTrimmed = String(name).trim();
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .ilike('name', nameTrimmed)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: `Product "${nameTrimmed}" already exists. Use a different name.` },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: nameTrimmed,
        price: Number(price),
        description: description ? String(description).trim() || null : null,
        category_id: category_id && String(category_id).trim() ? String(category_id).trim() : null,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
