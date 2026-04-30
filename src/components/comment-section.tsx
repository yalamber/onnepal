'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { timeAgo } from '@/lib/time-ago';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userName: string | null;
  userId: string;
}

interface CommentSectionProps {
  targetType: string;
  targetId: string;
}


export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json() as { comments: Comment[] };
        setComments(data.comments || []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(); }, [targetType, targetId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, content: content.trim() }),
      });
      if (res.status === 401) { setError('Please log in to comment'); toast.error('Please log in to comment'); return; }
      if (!res.ok) { setError('Failed to post comment'); toast.error('Failed to post comment'); return; }
      setContent('');
      toast.success('Comment posted');
      await fetchComments();
    } catch { setError('Something went wrong'); } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-950">Comments {comments.length > 0 && `(${comments.length})`}</h3>
      </div>

      {/* Post comment */}
      <div className="flex gap-2 mb-5">
        <input
          type="text" value={content} onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="Write a comment..."
          className="flex-1 h-9 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
        />
        <button onClick={handleSubmit} disabled={submitting || !content.trim()}
          className="h-9 px-3 bg-emerald-600 text-white rounded-md disabled:opacity-30 cursor-pointer transition-colors hover:bg-emerald-700">
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-400">
                {(c.userName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-gray-950">{c.userName || 'Anonymous'}</span>
                  <span className="text-[11px] text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
