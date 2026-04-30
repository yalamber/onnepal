'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  targetType: string;
  targetId: string;
}

export function BookmarkButton({ targetType, targetId }: BookmarkButtonProps) {
  const { userId, loading } = useCurrentUser();
  const [bookmarked, setBookmarked] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/bookmarks/check?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { bookmarked?: boolean } | null) => {
        if (data) setBookmarked(!!data.bookmarked);
      })
      .catch(() => {});
  }, [userId, targetType, targetId]);

  if (loading || !userId) return null;

  const toggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (res.ok) {
        const data = await res.json() as { bookmarked: boolean };
        setBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? 'Saved' : 'Removed from saved');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        bookmarked
          ? 'text-gray-950'
          : 'text-gray-400 hover:text-gray-950'
      }`}
    >
      <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
    </button>
  );
}
