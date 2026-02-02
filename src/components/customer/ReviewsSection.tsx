'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { StarRating } from './StarRating';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', rating: 5, comment: '' });

  useEffect(() => {
    fetch('/api/reviews?limit=12')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Review[]) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [submitted]);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.length < 2) return;
    setSubmitting(true);
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.name.trim(),
        customer_email: form.email.trim() || undefined,
        rating: form.rating,
        comment: form.comment.trim() || undefined,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setSubmitted(true);
          setForm({ name: '', email: '', rating: 5, comment: '' });
          setFormOpen(false);
        }
      })
      .finally(() => setSubmitting(false));
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const visibleReviews = reviews.slice(carouselIndex, carouselIndex + 3);
  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex + 3 < reviews.length;

  return (
    <section id="reviews" className="py-8 px-4 scroll-mt-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              Customer Reviews
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              What our customers say about us
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 flex items-center gap-2 tap-highlight"
          >
            <MessageSquare className="w-4 h-4" />
            Leave a Review
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No reviews yet. Be the first!</p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-red-700"
            >
              Leave a Review
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-3 overflow-hidden">
              {visibleReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft"
                >
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-2">&ldquo;{r.comment}&rdquo;</p>
                  )}
                  <p className="font-semibold text-dark dark:text-white text-sm">{r.customer_name}</p>
                  <p className="text-xs text-gray-500">{formatDate(r.created_at)}</p>
                </div>
              ))}
            </div>
            {reviews.length > 3 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                  disabled={!canPrev}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.min(reviews.length - 3, i + 1))}
                  disabled={!canNext}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-dark dark:text-white mb-4">Leave a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="John"
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating *</label>
                <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} size="md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment (optional)</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
