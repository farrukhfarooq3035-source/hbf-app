import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** GET /api/reviews - Public: approved reviews only */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('product_id');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  let query = supabaseAdmin
    .from('reviews')
    .select('id, customer_name, rating, comment, product_id, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.or(`product_id.eq.${productId},product_id.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

/** POST /api/reviews - Submit a review (public) */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customer_name, customer_email, rating, comment, product_id, order_id } = body as {
      customer_name?: string;
      customer_email?: string;
      rating?: number;
      comment?: string;
      product_id?: string | null;
      order_id?: string | null;
    };

    const name = typeof customer_name === 'string' ? customer_name.trim() : '';
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name (at least 2 characters)' },
        { status: 400 }
      );
    }

    const r = typeof rating === 'number' ? rating : parseInt(String(rating), 10);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return NextResponse.json(
        { error: 'Please select a rating from 1 to 5 stars' },
        { status: 400 }
      );
    }

    const { error: insError } = await supabaseAdmin.from('reviews').insert({
      customer_name: name,
      customer_email: typeof customer_email === 'string' ? customer_email.trim() || null : null,
      rating: r,
      comment: typeof comment === 'string' ? comment.trim() || null : null,
      product_id: product_id && String(product_id).trim() ? product_id : null,
      order_id: order_id && String(order_id).trim() ? order_id : null,
      is_approved: false,
    });

    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Thank you! Your review will appear after approval.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to submit review' },
      { status: 500 }
    );
  }
}
