'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpvoteButtonProps {
  postSlug: string;
  initialCount: number;
}

export function UpvoteButton({ postSlug, initialCount }: UpvoteButtonProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has upvoted
    fetch(`/api/posts/${postSlug}/upvote`)
      .then((res) => res.json())
      .then((data) => {
        const upvoteData = data as { upvoted: boolean };
        setUpvoted(upvoteData.upvoted);
      })
      .catch(console.error);
  }, [postSlug]);

  const handleUpvote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postSlug}/upvote`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = (await res.json()) as { upvoted: boolean };
        setUpvoted(data.upvoted);
        setCount((prev) => (data.upvoted ? prev + 1 : prev - 1));
      } else if (res.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Upvote error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        'active:scale-95',
        upvoted
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md hover:shadow-lg'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        loading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <ArrowUp className={cn('w-4 h-4 transition-transform', upvoted && 'animate-bounce')} />
      <span>{count}</span>
    </button>
  );
}
