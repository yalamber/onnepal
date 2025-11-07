import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getRecentPosts } from '@/lib/db/queries/posts';
import { PostCard } from '@/components/posts/post-card';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const d1 = await getD1Database();
  const db = getDb(d1);

  const posts = await getRecentPosts(db, 50);

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">All Posts</h1>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(({ post, author }) => (
              <PostCard key={post.id} post={post} author={author} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
