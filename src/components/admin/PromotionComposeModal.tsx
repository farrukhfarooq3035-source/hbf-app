'use client';

import { useState, useRef } from 'react';
import { X, Send, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerRow {
  phone: string;
  name: string;
}

interface PromotionComposeModalProps {
  open: boolean;
  onClose: () => void;
  customers: CustomerRow[];
}

function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return '92' + digits.slice(1);
  return '92' + digits;
}

export function PromotionComposeModal({ open, onClose, customers }: PromotionComposeModalProps) {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch('/api/admin/promotion/upload', { method: 'POST', headers, body: fd });
      const data = await res.json();
      if (res.ok && data.url) setImageUrl(data.url);
      else alert(data.error || 'Upload failed');
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const fullMessage = imageUrl ? `${message}\n\n📷 See offer: ${imageUrl}`.trim() : message;
  const encodedMessage = encodeURIComponent(fullMessage);

  const openWhatsApp = (phone: string) => {
    const num = toWhatsAppNumber(phone);
    window.open(`https://wa.me/${num}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  const openNext = () => {
    if (!fullMessage.trim()) {
      alert('Enter a message first');
      return;
    }
    if (currentIndex >= customers.length) {
      setCurrentIndex(0);
      return;
    }
    openWhatsApp(customers[currentIndex].phone);
    setCurrentIndex((i) => Math.min(i + 1, customers.length));
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(fullMessage);
    alert('Message copied! Paste in WhatsApp.');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Send Promotion via WhatsApp</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. 🎉 New Deal! 20% off on all burgers. Valid till Sunday. Order now!"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image (optional)</label>
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload image'}
              </button>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
              </div>
            )}
          </div>
          {fullMessage && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{fullMessage}</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Opens WhatsApp with pre-filled message. Send to each contact, then click Next for the next.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyMessage}
              disabled={!fullMessage.trim()}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Copy message
            </button>
            <button
              type="button"
              onClick={openNext}
              disabled={!fullMessage.trim() || customers.length === 0}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {currentIndex >= customers.length
                ? 'Start over'
                : `Open WhatsApp (${currentIndex + 1}/${customers.length})`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
