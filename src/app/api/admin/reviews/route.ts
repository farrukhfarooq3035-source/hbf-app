import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** GET /api/admin/reviews - All reviews (admin) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const approved = searchParams.get('approved');

  let query = supabaseAdmin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (approved === 'true') query = query.eq('is_approved', true);
  else if (approved === 'false' || approved === 'pending') query = query.eq('is_approved', false);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

/** PATCH /api/admin/reviews - Approve or reject a review */
export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, is_approved } = body as { id?: string; is_approved?: boolean };

    if (!id || typeof is_approved !== 'boolean') {
      return NextResponse.json(
        { error: 'id and is_approved (boolean) are required' },
        { status: 400 }
      );
    }

    const { error: updError } = await supabaseAdmin
      .from('reviews')
      .update({ is_approved })
      .eq('id', id);

    if (updError) {
      return NextResponse.json({ error: updError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update review' },
      { status: 500 }
    );
  }
}
