import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

type RouteContext = { params: Promise<{ id: string }> };

function generateReceiptNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${year}${random}`;
}

export async function POST(_: Request, context: RouteContext) {
  const { id: orderId } = await context.params;
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, receipt_number, receipt_issued_at')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const receiptNumber = order.receipt_number || generateReceiptNumber();

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      receipt_number: receiptNumber,
      receipt_issued_at: now,
      invoice_status: 'issued',
      last_invoice_edit_at: now,
    })
    .eq('id', orderId)
    .select('id, receipt_number, receipt_issued_at, invoice_status, last_invoice_edit_at')
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
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }
  updates.last_invoice_edit_at = new Date().toISOString();

  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, receipt_number, receipt_issued_at, invoice_status, last_invoice_edit_at')
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: error?.message || 'Failed to update invoice' }, { status: 500 });
  }

  return NextResponse.json(updated);
}
