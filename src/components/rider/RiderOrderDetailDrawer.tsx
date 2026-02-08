'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import {
  MapPin,
  Phone,
  MessageCircle,
  X,
  ExternalLink,
  Send,
  Loader2,
} from 'lucide-react';
import { formatOrderNumber } from '@/lib/order-utils';

interface RiderOrder {
  id: string;
  status: string;
  total_price: number;
  customer_name: string;
  address: string;
  phone: string;
  created_at: string;
  payment_method?: 'cod' | 'jazzcash' | null;
  jazzcash_proof_url?: string | null;
}

interface ChatMessage {
  id: string;
  sender_type: string;
  sender_id: string | null;
  message: string;
  created_at: string;
}

function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length >= 12) return digits;
  if (digits.startsWith('0') && digits.length >= 10) return '92' + digits.slice(1);
  if (digits.length >= 10) return '92' + digits.slice(-10);
  return '92' + digits;
}

export function RiderOrderDetailDrawer({
  order,
  open,
  onClose,
}: {
  order: RiderOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mapUrl = useMemo(() => {
    if (!order?.address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;
  }, [order?.address]);

  const whatsappUrl = useMemo(() => {
    if (!order?.phone) return null;
    const num = normalizePhoneForWhatsApp(order.phone);
    return `https://wa.me/${num}`;
  }, [order?.phone]);

  const callUrl = useMemo(() => {
    if (!order?.phone) return null;
    const digits = order.phone.replace(/\D/g, '');
    return `tel:${digits.length >= 10 ? '+' + (digits.startsWith('92') ? digits : '92' + digits.replace(/^0/, '')) : order.phone}`;
  }, [order?.phone]);

  useEffect(() => {
    if (!open || !order?.id) return;
    setMessages([]);
    setChatOpen(false);
    setDraft('');
  }, [open, order?.id]);

  useEffect(() => {
    if (!open || !order?.id || !chatOpen) return;
    setLoading(true);
    fetch(`/api/rider/orders/${order.id}/chat`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { messages: [], thread_id: null }))
      .then((data) => {
        setThreadId(data.thread_id ?? null);
        setMessages(data.messages ?? []);
      })
      .catch(() => {
        setThreadId(null);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [open, order?.id, chatOpen]);

  useEffect(() => {
    if (!chatOpen || !threadId) return;
    const ch = supabase
      .channel(`rider-order-chat-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [chatOpen, threadId]);

  useEffect(() => {
    if (!chatOpen) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current?.scrollHeight ?? 0,
        behavior: 'smooth',
      });
    });
  }, [messages, chatOpen]);

  const sendMessage = async () => {
    if (!order?.id || !draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/rider/orders/${order.id}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: draft.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.id) {
        setDraft('');
        setMessages((prev) => [...prev, data]);
      }
    } finally {
      setSending(false);
    }
  };

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="font-semibold text-dark dark:text-white">
            {formatOrderNumber(order.id)} · {order.customer_name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick actions: Message | Call | Map - Foodpanda style */}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => setChatOpen((o) => !o)}
              className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-medium transition-colors ${
                chatOpen ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">Message</span>
            </button>
            {callUrl && (
              <a
                href={callUrl}
                className="flex-1 min-w-[80px] flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Phone className="w-6 h-6" />
                <span className="text-sm">Call</span>
              </a>
            )}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[80px] flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <MapPin className="w-6 h-6" />
                <span className="text-sm">Map</span>
              </a>
            )}
          </div>

          {/* Address & phone */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <p className="font-medium text-dark dark:text-white text-sm">Address</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{order.address || '—'}</p>
            {order.phone && (
              <>
                <p className="font-medium text-dark dark:text-white text-sm mt-2">Phone</p>
                <p className="text-primary font-mono">{order.phone}</p>
              </>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#20bd5a] mt-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.865 9.865 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>

          {/* Order info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-1 text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy · h:mm a') : ''}
            </p>
            <p className="font-medium text-dark dark:text-white">Rs {order.total_price}/-</p>
            <span
              className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                order.payment_method === 'jazzcash'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {order.payment_method === 'jazzcash' ? 'Jazz Cash' : 'COD'}
            </span>
            {order.payment_method === 'jazzcash' && order.jazzcash_proof_url && (
              <a
                href={order.jazzcash_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Check proof
              </a>
            )}
          </div>

          {/* In-app chat */}
          {chatOpen && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 font-medium text-dark dark:text-white text-sm">
                Chat with customer
              </div>
              <div
                ref={scrollRef}
                className="h-48 overflow-y-auto p-4 space-y-2 bg-gray-50/50 dark:bg-gray-800/50"
              >
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    No messages yet. Send first message.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'rider' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          msg.sender_type === 'rider'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {msg.sender_type !== 'rider' && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Customer</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.sender_type === 'rider' ? 'text-white/75' : 'text-gray-400'
                          }`}
                        >
                          {msg.created_at ? format(new Date(msg.created_at), 'h:mm a') : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type message..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!draft.trim() || sending}
                  className="rounded-xl bg-primary text-white px-4 py-2 font-semibold disabled:opacity-50 flex items-center gap-1"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
