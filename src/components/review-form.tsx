'use client';

import { useState } from 'react';

interface ReviewFormProps {
  businessId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ businessId, onSubmitted }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/business/reviews?businessId=${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: name.trim(),
          rating,
          content: content.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to submit');
        return;
      }
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-gray-100 rounded-lg p-6 text-center">
        <p className="font-medium text-gray-950">Thank you for your review!</p>
        <p className="text-sm text-gray-400 mt-1">It will appear once approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-100 rounded-lg p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-950">Leave a review</p>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your name</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)} required
          placeholder="Your name"
          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star} type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl cursor-pointer transition-colors"
              style={{ color: star <= (hoverRating || rating) ? '#eab308' : '#d1d5db' }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Comment <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={content} onChange={(e) => setContent(e.target.value)} rows={3}
          placeholder="Tell others about your experience..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={submitting || !name.trim() || rating === 0}
        className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}
