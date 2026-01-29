import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    let body: { phone?: string; stars?: number; delivery?: number | string; quality?: number | string; comment?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { phone, stars, delivery, quality, comment } = body;

    if (!phone || stars == null || stars === undefined) {
      return NextResponse.json(
        { error: 'phone and stars (1-5) required' },
        { status: 400 }
      );
    }

    const starsNum = Number(stars);
    if (starsNum < 1 || starsNum > 5) {
      return NextResponse.json(
        { error: 'stars must be between 1 and 5' },
        { status: 400 }
      );
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, phone, status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      console.error('[rate] fetch error:', fetchError);
      return NextResponse.json(
        { error: fetchError?.message || 'Order not found' },
        { status: 404 }
      );
    }

    const orderPhone = (order.phone || '').toString().trim();
    const inputPhone = (phone || '').toString().trim();
    if (orderPhone !== inputPhone) {
      return NextResponse.json(
        { error: 'Phone does not match this order' },
        { status: 403 }
      );
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Only delivered orders can be rated' },
        { status: 400 }
      );
    }

    const updates = {
      rating_stars: Math.min(5, Math.max(1, starsNum)),
      rating_delivery:
        delivery != null && delivery !== ''
          ? Math.min(5, Math.max(1, Number(delivery)))
          : null,
      rating_quality:
        quality != null && quality !== ''
          ? Math.min(5, Math.max(1, Number(quality)))
          : null,
      rating_comment: comment ? String(comment).slice(0, 500) : null,
      rated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('[rate] update error:', updateError);
      return NextResponse.json(
        {
          error: updateError.message || 'Failed to save rating',
          hint: 'Make sure you ran migration 002_order_ratings.sql in Supabase (adds rating_stars, rating_delivery, rating_quality, rating_comment, rated_at to orders).',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[rate] unexpected error:', e);
    const message = e instanceof Error ? e.message : 'Failed to save rating';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
