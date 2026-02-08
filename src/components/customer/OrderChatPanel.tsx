'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { OrderChatMessage } from '@/types';
import { format } from 'date-fns';
import { Loader2, Send, X } from 'lucide-react';

interface OrderChatPanelProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onClose: () => void;
  userId?: string | null;
}

export function OrderChatPanel({ orderId, orderNumber, open, onClose, userId }: OrderChatPanelProps) {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const storageKey = useMemo(() => `order-chat-draft-${orderId}`, [orderId]);

  useEffect(() => {
    if (!open) return;
    supabase.auth.getSession().then(({ data }) => {
      setAuthToken(data.session?.access_token ?? null);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const savedDraft =
      typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
    if (savedDraft) {
      setDraft(savedDraft);
    } else {
      setDraft('');
    }
  }, [open, storageKey]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(storageKey, draft);
  }, [draft, open, storageKey]);

  useEffect(() => {
    if (!open || !authToken) return;
    let isMounted = true;
    const fetchChat = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${orderId}/chat`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || 'Unable to load chat right now.');
        }
        if (!isMounted) return;
        setThreadId(body.thread_id ?? null);
        setMessages(body.messages ?? []);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchChat();
    return () => {
      isMounted = false;
    };
  }, [open, orderId, authToken]);

  useEffect(() => {
    if (!open || !threadId) return;
    const channel = supabase
      .channel(`order-chat-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const message = payload.new as OrderChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
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
      const existing = groups.find((g) => g.date === date);
      if (existing) {
        existing.items.push(msg);
      } else {
        groups.push({ date, items: [msg] });
      }
    });
    return groups;
  }, [messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !authToken) return;
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Support chat</p>
            <p className="text-lg font-semibold text-gray-900">{orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close chat panel"
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
            <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-4 space-y-6">
              {groupedMessages.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-6">
                  Start a conversation with our support team.
                </div>
              )}
              {groupedMessages.map((group) => (
                <div key={group.date} className="space-y-2">
                  <p className="text-center text-xs text-gray-400 uppercase tracking-wide">
                    {group.date}
                  </p>
                  {group.items.map((msg) => {
                    const isSelf = msg.sender_type === 'customer' && msg.sender_id === userId;
                    const senderLabel = msg.sender_type === 'rider' ? 'Rider' : msg.sender_type === 'admin' ? 'Support' : null;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            isSelf
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none'
                          }`}
                        >
                          {senderLabel && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">{senderLabel}</p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isSelf ? 'text-white/75' : 'text-gray-400'
                            }`}
                          >
                            {msg.created_at
                              ? format(new Date(msg.created_at), 'h:mm a')
                              : 'Just now'}
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
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message..."
              rows={2}
              className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim() || sending || !authToken}
              className="rounded-2xl bg-primary text-white px-4 py-2 font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            Our team usually responds within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
