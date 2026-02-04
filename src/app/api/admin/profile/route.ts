import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** GET /api/admin/profile - Get admin profile (display_name) by email. Requires Authorization: Bearer <token> */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ display_name: null }, { status: 200 });
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) {
    return NextResponse.json({ display_name: null }, { status: 200 });
  }
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('display_name')
    .ilike('email', user.email.trim())
    .maybeSingle();
  return NextResponse.json({ display_name: data?.display_name ?? null });
}

/** PATCH /api/admin/profile - Update admin display name */
export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : null;

  const { error: updateError } = await supabaseAdmin
    .from('admin_users')
    .update({ display_name: displayName || null })
    .ilike('email', user.email.trim());

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({ display_name: displayName });
}
