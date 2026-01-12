import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPostBySlug } from '@/lib/db/queries/posts';
import { getPostTags } from '@/lib/db/queries/tags';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MarkdownContent } from '@/components/markdown-content';
import { UpvoteButton } from '@/components/posts/upvote-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate, timeAgo } from '@/lib/utils';
import { ArrowLeft, Eye, Calendar, Clock, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const d1 = await getD1Database();
  const db = getDb(d1);

  const result = await getPostBySlug(db, slug);

  if (!result) {
    notFound();
  }

  const { post, author } = result;
  const tags = await getPostTags(db, post.id);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <Link
                href={`/users/${author.username}`}
                className="font-medium hover:text-gray-900"
              >
                {author.displayName || author.username}
              </Link>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={new Date(post.createdAt).toISOString()}>
                  {formatDate(post.createdAt)}
                </time>
              </div>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>

            <div className="flex items-center gap-6 pb-6 border-b">
              <UpvoteButton postSlug={post.slug} initialCount={post.upvoteCount} />
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount} views</span>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <MarkdownContent content={post.content} />
        </article>

        {post.status === 'pending' && (
          <Alert className="mt-8 border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Status:</strong> This post is pending moderation review.
            </AlertDescription>
          </Alert>
        )}

        {post.status === 'rejected' && (
          <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Status:</strong> This post was rejected by moderators.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  );
}
