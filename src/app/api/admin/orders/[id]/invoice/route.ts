import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

type RouteContext = { params: Promise<{ id: string }> };

/** Format: #MM-NNNN (e.g. #02-0001) - month + sequential */
async function generateReceiptNumber(): Promise<string> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `#${month}-`;
  const year = now.getFullYear();
  const nextMonth = now.getMonth() + 2;
  const nextMonthStr = nextMonth > 12 ? '01' : String(nextMonth).padStart(2, '0');
  const nextYear = nextMonth > 12 ? year + 1 : year;
  const monthStart = `${year}-${month}-01T00:00:00`;
  const monthEnd = `${nextYear}-${nextMonthStr}-01T00:00:00`;

  const { count } = await supabaseAdmin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('receipt_issued_at', monthStart)
    .lt('receipt_issued_at', monthEnd)
    .like('receipt_number', `${prefix}%`);

  const seq = (count ?? 0) + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function POST(req: Request, context: RouteContext) {
  const { id: orderId } = await context.params;
  const body = await req.json().catch(() => ({}));
  let adminName = typeof body.generated_by === 'string' ? body.generated_by.trim() : null;

  if (!adminName) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user?.email) {
        const { data: admin } = await supabaseAdmin
          .from('admin_users')
          .select('display_name')
          .ilike('email', user.email.trim())
          .maybeSingle();
        adminName = admin?.display_name ?? null;
      }
    }
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, receipt_number, receipt_issued_at')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const receiptNumber = order.receipt_number || (await generateReceiptNumber());

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      receipt_number: receiptNumber,
      receipt_issued_at: now,
      invoice_generated_by: adminName,
      invoice_status: 'issued',
      last_invoice_edit_at: now,
    })
    .eq('id', orderId)
    .select('id, receipt_number, receipt_issued_at, invoice_generated_by, invoice_status, last_invoice_edit_at')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: orderId } = await context.params;
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, unknown> = {};
  if (typeof body.receipt_number === 'string' && body.receipt_number.trim().length > 0) {
    updates.receipt_number = body.receipt_number.trim();
  }
  if (body.invoice_status) {
    updates.invoice_status = body.invoice_status;
  }
  if (body.receipt_issued_at) {
    updates.receipt_issued_at = new Date(body.receipt_issued_at).toISOString();
  }
  if (typeof body.invoice_generated_by === 'string') {
    updates.invoice_generated_by = body.invoice_generated_by.trim() || null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }
  updates.last_invoice_edit_at = new Date().toISOString();

  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, receipt_number, receipt_issued_at, invoice_generated_by, invoice_status, last_invoice_edit_at')
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: error?.message || 'Failed to update invoice' }, { status: 500 });
  }

  return NextResponse.json(updated);
}
