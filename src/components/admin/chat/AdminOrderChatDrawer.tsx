'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { OrderChatMessage } from '@/types';
import { format } from 'date-fns';
import { Loader2, Send, X } from 'lucide-react';

interface AdminOrderChatDrawerProps {
  open: boolean;
  orderId: string | null;
  orderNumber?: string;
  customerName?: string;
  onClose: () => void;
}

export function AdminOrderChatDrawer({
  open,
  orderId,
  orderNumber,
  customerName,
  onClose,
}: AdminOrderChatDrawerProps) {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setThreadId(null);
      setDraft('');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !orderId) return;
    let isActive = true;
    const loadChat = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/chat`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || 'Unable to load chat');
        }
        if (!isActive) return;
        setThreadId(body.thread_id ?? null);
        setMessages(body.messages ?? []);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        if (isActive) setLoading(false);
      }
    };
    loadChat();
    return () => {
      isActive = false;
    };
  }, [open, orderId]);

  useEffect(() => {
    if (!open || !threadId) return;
    const channel = supabase
      .channel(`admin-order-chat-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const msg = payload.new as OrderChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, threadId]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages, open]);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; items: OrderChatMessage[] }[] = [];
    messages.forEach((msg) => {
      const date = msg.created_at ? format(new Date(msg.created_at), 'MMM d, yyyy') : 'Unknown';
      const group = groups.find((g) => g.date === date);
      if (group) group.items.push(msg);
      else groups.push({ date, items: [msg] });
    });
    return groups;
  }, [messages]);

  const sendMessage = async () => {
    if (!orderId || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: draft }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Failed to send');
      }
      setDraft('');
      if (body?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === body.id)) return prev;
          return [...prev, body];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!open || !orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Order chat</p>
            <p className="text-lg font-semibold text-gray-900">
              {orderNumber || 'Order'}
              {customerName ? <span className="text-sm text-gray-500 ml-2">· {customerName}</span> : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close chat drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 bg-gray-50">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div ref={scrollRef} className="h-full overflow-y-auto px-6 py-5 space-y-6">
              {groupedMessages.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-8">
                  No chat history yet. Start the conversation below.
                </div>
              )}
              {groupedMessages.map((group) => (
                <div key={group.date} className="space-y-2">
                  <p className="text-center text-xs text-gray-400 uppercase tracking-wide">
                    {group.date}
                  </p>
                  {group.items.map((msg) => {
                    const isAdmin = msg.sender_type === 'admin';
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            isAdmin
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isAdmin ? 'text-white/70' : 'text-gray-400'
                            }`}
                          >
                            {msg.created_at ? format(new Date(msg.created_at), 'h:mm a') : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-4 bg-white">
          {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
          <div className="flex items-end gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a reply..."
              rows={2}
              className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim() || sending}
              className="rounded-2xl bg-primary text-white px-4 py-2 font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            Customer will get a push notification for each admin reply.
          </p>
        </div>
      </div>
    </div>
  );
}
