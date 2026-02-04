import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** GET /api/admin/check - Verify if user is admin. Requires Authorization: Bearer <access_token> */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('email')
    .ilike('email', user.email.trim())
    .maybeSingle();
  return NextResponse.json({ isAdmin: !!data });
}
