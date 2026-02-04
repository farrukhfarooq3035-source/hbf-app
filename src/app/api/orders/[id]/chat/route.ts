import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ensureChatThread, listChatMessages } from '@/lib/chat-server';

type RouteContext = { params: Promise<{ id: string }> };

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length);
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

async function assertOrderOwnership(orderId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_id')
    .eq('id', orderId)
    .single();
  if (error || !data) {
    return { ok: false, status: 404, message: 'Order not found' as const };
  }
  if (!data.user_id || data.user_id !== userId) {
    return { ok: false, status: 403, message: 'You do not have access to this order' as const };
  }
  return { ok: true };
}

export async function GET(req: Request, context: RouteContext) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Auth token required' }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
  }
  const ownership = await assertOrderOwnership(id, user.id);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.message }, { status: ownership.status });
  }

  let messages;
  let threadId: string;
  try {
    threadId = await ensureChatThread(id, 'customer_support', user.id);
    messages = await listChatMessages(threadId);
    await supabaseAdmin
      .from('order_chat_threads')
      .update({ unread_for_customer: false })
      .eq('id', threadId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load messages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json({
    thread_id: threadId,
    messages: messages || [],
  });
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Auth token required' }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
  }
  const ownership = await assertOrderOwnership(id, user.id);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.message }, { status: ownership.status });
  }
  let payload: { message?: string; attachments?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const text = (payload.message || '').trim();
  if (!text) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  const sanitized = text.slice(0, 2000);
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

  let threadId: string;
  try {
    threadId = await ensureChatThread(id, 'customer_support', user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create thread';
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const { data, error } = await supabaseAdmin
    .from('order_chat_messages')
    .insert({
      thread_id: threadId,
      order_id: id,
      sender_type: 'customer',
      sender_id: user.id,
      message: sanitized,
      attachments,
    })
    .select('id, thread_id, sender_type, sender_id, message, attachments, created_at')
    .single();
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to send message' }, { status: 500 });
  }
  await supabaseAdmin
    .from('order_chat_threads')
    .update({
      last_message_at: data.created_at,
      last_message_preview: sanitized.slice(0, 160),
      last_customer_message_at: data.created_at,
      unread_for_admin: true,
      unread_for_customer: false,
    })
    .eq('id', threadId);
  return NextResponse.json(data, { status: 201 });
}
