'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/posts/post-card';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: string;
  createdAt: Date;
}

interface PostWithAuthor {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    status: string;
    upvoteCount: number;
    viewCount: number;
    createdAt: number | Date;
  };
  author: {
    username: string;
    displayName: string | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = (await res.json()) as { user: User };
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // Note: You'll need to create this endpoint
      const res = await fetch('/api/users/me/posts');
      if (res.ok) {
        const data = (await res.json()) as { posts: PostWithAuthor[] };
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Display Name:</strong> {user.displayName || 'Not set'}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Total Posts:</strong> {posts.length}
                </p>
                <p>
                  <strong>Published:</strong> {posts.filter((p) => p.post.status === 'published').length}
                </p>
                <p>
                  <strong>Pending:</strong> {posts.filter((p) => p.post.status === 'pending').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a href="/submit" className="block text-orange-600 hover:underline">
                  Submit New Post
                </a>
                {(user.role === 'moderator' || user.role === 'admin') && (
                  <a href="/moderate" className="block text-orange-600 hover:underline">
                    Moderation Queue
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Posts</CardTitle>
            <CardDescription>All posts you&apos;ve submitted to OnNepal</CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">You haven&apos;t submitted any posts yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map(({ post, author }) => (
                  <PostCard key={post.id} post={post} author={author} showUpvote={false} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
