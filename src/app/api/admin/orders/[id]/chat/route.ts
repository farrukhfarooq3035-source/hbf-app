import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ensureChatThread, listChatMessages } from '@/lib/chat-server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel') ?? 'customer_support';

  try {
    const threadId = await ensureChatThread(id, channel);
    await supabaseAdmin
      .from('order_chat_threads')
      .update({ unread_for_admin: false })
      .eq('id', threadId);
    const messages = await listChatMessages(threadId);
    return NextResponse.json({ thread_id: threadId, channel, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load chat';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel') ?? 'customer_support';
  let payload: { message?: string; sender_type?: string; sender_id?: string; attachments?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const text = (payload.message || '').trim();
  if (!text) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  const senderType = (payload.sender_type || 'admin').toLowerCase();
  if (!['admin', 'rider', 'system'].includes(senderType)) {
    return NextResponse.json({ error: 'Unsupported sender_type' }, { status: 400 });
  }
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

  try {
    const threadId = await ensureChatThread(id, channel);
    const { data, error } = await supabaseAdmin
      .from('order_chat_messages')
      .insert({
        thread_id: threadId,
        order_id: id,
        sender_type: senderType,
        sender_id: payload.sender_id ?? null,
        message: text.slice(0, 2000),
        attachments,
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
        last_message_preview: text.slice(0, 160),
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
