import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ensureChatThread, listChatMessages } from '@/lib/chat-server';

const RIDER_COOKIE = 'hbf_rider_id';

async function getRiderFromRequest(req: NextRequest) {
  const riderId = req.cookies.get(RIDER_COOKIE)?.value;
  if (!riderId) return null;
  const { data } = await supabaseAdmin
    .from('riders')
    .select('id')
    .eq('id', riderId)
    .eq('status', 'active')
    .maybeSingle();
  return data ? riderId : null;
}

async function assertRiderOrderAccess(orderId: string, riderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, rider_id')
    .eq('id', orderId)
    .single();
  if (error || !data) {
    return { ok: false, status: 404, message: 'Order not found' as const };
  }
  if (data.rider_id !== riderId) {
    return { ok: false, status: 403, message: 'Not your order' as const };
  }
  return { ok: true };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const riderId = await getRiderFromRequest(req);
  if (!riderId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
  }
  const access = await assertRiderOrderAccess(id, riderId);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }
  try {
    const threadId = await ensureChatThread(id, 'customer_support');
    const messages = await listChatMessages(threadId);
    return NextResponse.json({ thread_id: threadId, messages: messages || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load chat';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const riderId = await getRiderFromRequest(req);
  if (!riderId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
  }
  const access = await assertRiderOrderAccess(id, riderId);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }
  let payload: { message?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const text = (payload.message || '').trim();
  if (!text) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  const sanitized = text.slice(0, 2000);
  try {
    const threadId = await ensureChatThread(id, 'customer_support');
    const { data, error } = await supabaseAdmin
      .from('order_chat_messages')
      .insert({
        thread_id: threadId,
        order_id: id,
        sender_type: 'rider',
        sender_id: riderId,
        message: sanitized,
        attachments: [],
      })
      .select('id, thread_id, sender_type, sender_id, message, attachments, created_at')
      .single();
    if (error || !data) {
      throw error ?? new Error('Failed to save message');
    }
    await supabaseAdmin
      .from('order_chat_threads')
      .update({
        last_message_at: data.created_at,
        last_message_preview: sanitized.slice(0, 160),
        last_admin_message_at: data.created_at,
        unread_for_customer: true,
        unread_for_admin: false,
      })
      .eq('id', threadId);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
