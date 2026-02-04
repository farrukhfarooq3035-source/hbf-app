import { supabaseAdmin } from './supabase-server';

export async function ensureChatThread(
  orderId: string,
  channel = 'customer_support',
  createdBy?: string | null
) {
  const { data: existing } = await supabaseAdmin
    .from('order_chat_threads')
    .select('id')
    .eq('order_id', orderId)
    .eq('channel', channel)
    .maybeSingle();
  if (existing?.id) {
    return existing.id as string;
  }
  const { data, error } = await supabaseAdmin
    .from('order_chat_threads')
    .upsert(
      {
        order_id: orderId,
        channel,
        created_by: createdBy ?? null,
      },
      { onConflict: 'order_id,channel' }
    )
    .select('id')
    .single();
  if (error || !data?.id) {
    throw error ?? new Error('Failed to upsert chat thread');
  }
  return data.id as string;
}

export async function listChatMessages(threadId: string, limit = 500) {
  const { data, error } = await supabaseAdmin
    .from('order_chat_messages')
    .select('id, thread_id, order_id, sender_type, sender_id, message, attachments, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) {
    throw error;
  }
  return data || [];
}
