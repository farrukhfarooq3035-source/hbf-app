'use client';

import { useState, useEffect } from 'react';
import { Star, Check, X, Loader2, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  rating: number;
  comment?: string | null;
  product_id?: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const fetchReviews = () => {
    setLoading(true);
    const q = filter === 'all' ? '' : `?approved=${filter === 'approved' ? 'true' : 'false'}`;
    fetch(`/api/admin/reviews${q}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Review[]) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const updateApproval = (id: string, is_approved: boolean) => {
    fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved }),
    })
      .then((res) => {
        if (res.ok) fetchReviews();
      });
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return s;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Star className="w-7 h-7 text-amber-500" />
        Customer Reviews
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Approve or reject reviews. Only approved reviews appear on the app.
      </p>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium capitalize ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`p-5 rounded-2xl border ${
                r.is_approved
                  ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{r.customer_name}</span>
                    <span className="text-sm text-gray-500">{formatDate(r.created_at)}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{r.comment}</p>
                  )}
                </div>
                {!r.is_approved ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateApproval(r.id, true)}
                      className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 flex items-center gap-1"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateApproval(r.id, false)}
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Approved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
