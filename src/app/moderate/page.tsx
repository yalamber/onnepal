'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface PendingPost {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: Date;
  };
  author: {
    username: string;
    displayName: string | null;
  };
}

export default function ModerationPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingPosts = async () => {
    try {
      const res = await fetch('/api/moderate/posts');
      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }
      const data = (await res.json()) as { posts: PendingPost[] };
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching pending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (postId: string, action: 'approve' | 'reject') => {
    setActionLoading(postId);
    try {
      const res = await fetch(`/api/moderate/posts/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reason[postId] }),
      });

      if (res.ok) {
        // Remove from list
        setPosts(posts.filter((p) => p.post.id !== postId));
        setReason((prev) => {
          const newReason = { ...prev };
          delete newReason[postId];
          return newReason;
        });
      }
    } catch (error) {
      console.error('Error moderating post:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Moderation Queue</h1>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-xl text-gray-500">No posts pending moderation</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map(({ post, author }) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                      <div className="text-sm text-gray-600">
                        By {author.displayName || author.username} • {timeAgo(post.createdAt)}
                      </div>
                    </div>
                    <Link href={`/posts/${post.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View Full Post
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 line-clamp-6">{post.content.substring(0, 500)}...</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reason (optional for approve, required for reject)</label>
                    <Textarea
                      value={reason[post.id] || ''}
                      onChange={(e) => setReason({ ...reason, [post.id]: e.target.value })}
                      placeholder="Enter reason for rejection or notes..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleAction(post.id, 'approve')}
                      disabled={actionLoading === post.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === post.id ? 'Processing...' : 'Approve & Publish'}
                    </Button>
                    <Button
                      onClick={() => handleAction(post.id, 'reject')}
                      disabled={actionLoading === post.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {actionLoading === post.id ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
