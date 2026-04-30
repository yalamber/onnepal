'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import { timeAgo } from '@/lib/time-ago';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SafeMarkdown } from '@/components/safe-markdown';
import { toast } from 'sonner';

interface Discussion {
  id: string; userId: string; title: string; content: string | null; category: string;
  replyCount: number; lastActivityAt: string; createdAt: string; userName: string | null;
}

interface Reply {
  id: string; userId: string; content: string; createdAt: string; userName: string | null;
}

export default function DiscussionDetail({ initialData, initialReplies }: { initialData?: Discussion | null; initialReplies?: Reply[] }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId, isOwner } = useCurrentUser();
  const [discussion, setDiscussion] = useState<Discussion | null>(initialData || null);
  const [replies, setReplies] = useState<Reply[]>(initialReplies || []);
  const [loading, setLoading] = useState(!initialData);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) return;
    fetch(`/api/discussions/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Discussion; replies: Reply[] } | null) => {
        if (d) { setDiscussion(d.item); setReplies(d.replies); }
      }).finally(() => setLoading(false));
  }, [id]);

  const deleteDiscussion = async () => {
    if (!confirm('Delete this discussion?')) return;
    const res = await fetch(`/api/discussions/${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Failed to delete'); return; }
    toast.success('Discussion deleted');
    router.push('/discussions');
  };

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${id}/replies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (res.status === 401) { toast.error('Please log in to reply'); return; }
      if (!res.ok) { toast.error('Failed to post reply'); return; }
      setReplyContent('');
      toast.success('Reply posted');
      const r = await fetch(`/api/discussions/${id}`);
      if (r.ok) { const d = await r.json(); setDiscussion(d.item); setReplies(d.replies); }
    } catch { toast.error('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!discussion) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-500 mb-4">Discussion not found</p>
      <Link href="/discussions" className="text-sm text-gray-400 hover:text-gray-950">Back to Discussions</Link>
    </div>
  );

  const owner = isOwner(discussion.userId);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/discussions" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Discussions
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{discussion.title}</h1>
            {owner && (
              <button onClick={deleteDiscussion} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-600">{discussion.category}</span>
            <Link href={`/user/${discussion.userId}`} className="hover:text-gray-950 transition-colors">{discussion.userName || 'Anonymous'}</Link>
            <span>&middot;</span>
            <span>{timeAgo(discussion.createdAt)}</span>
          </div>
          {discussion.content && (
            <SafeMarkdown content={discussion.content} />
          )}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-950">Replies {replies.length > 0 && `(${replies.length})`}</h3>
          </div>

          <div className="flex gap-2 mb-6">
            <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
              placeholder="Write a reply..."
              className="flex-1 h-9 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
            <button onClick={submitReply} disabled={submitting || !replyContent.trim()}
              className="h-9 px-3 bg-gray-950 text-white rounded-md disabled:opacity-30 cursor-pointer transition-colors hover:bg-gray-800">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>

          {replies.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No replies yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {replies.map((r) => (
                <div key={r.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-400">
                    {(r.userName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/user/${r.userId}`} className="text-xs font-medium text-gray-950 hover:underline">{r.userName || 'Anonymous'}</Link>
                      <span className="text-[11px] text-gray-400">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="mt-0.5"><SafeMarkdown content={r.content} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
