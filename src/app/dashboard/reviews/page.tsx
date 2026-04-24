'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Trash2, Check, Clock } from 'lucide-react';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  content: string | null;
  isApproved: boolean;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/reviews?businessId=${business.id}&all=true`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { reviews?: Review[] } = await res.json();
      setReviews(data.reviews || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [business]);

  const approveReview = async (id: string) => {
    if (!business) return;
    const res = await fetch(`/api/business/reviews/${id}?businessId=${business.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: true }),
    });
    if (res.ok) {
      setReviews(reviews.map((r) => r.id === id ? { ...r, isApproved: true } : r));
    }
  };

  const deleteReview = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/reviews/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="reviews" label="Reviews" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage reviews from your customers</p>
      </div>

      {/* List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Reviews will appear here when customers leave feedback</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {reviews.map((review) => (
            <div key={review.id} className="px-4 py-4 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-gray-900">{review.reviewerName}</p>
                    <StarRating rating={review.rating} />
                    {review.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <Check className="h-2.5 w-2.5" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Clock className="h-2.5 w-2.5" /> Pending
                      </span>
                    )}
                  </div>
                  {review.content && (
                    <p className="text-sm text-gray-500 mt-1.5">{review.content}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1.5">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!review.isApproved && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => approveReview(review.id)}
                      className="text-gray-300 hover:text-green-600 h-8 w-8 cursor-pointer"
                      title="Approve"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReview(review.id)}
                    className="text-gray-300 hover:text-red-500 h-8 w-8 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
