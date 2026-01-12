'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UpvoteButton } from './upvote-button';
import { timeAgo, truncate } from '@/lib/utils';
import { ArrowUp, Eye } from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    upvoteCount: number;
    viewCount: number;
    createdAt: Date | number;
  };
  author: {
    username: string;
    displayName: string | null;
  };
  showUpvote?: boolean;
}

export function PostCard({ post, author, showUpvote = true }: PostCardProps) {
  return (
    <Card className="group h-full flex flex-col">
      <CardHeader className="flex-1">
        <Link href={`/posts/${post.slug}`} className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
              {truncate(post.excerpt, 150)}
            </p>
          )}
        </Link>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs">
              {(author.displayName || author.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/users/${author.username}`}
            className="font-medium text-slate-700 hover:text-orange-600 transition-colors truncate"
          >
            {author.displayName || author.username}
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{timeAgo(post.createdAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-4 border-t border-slate-100 pt-4">
        {showUpvote ? (
          <UpvoteButton postSlug={post.slug} initialCount={post.upvoteCount} />
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700">
            <ArrowUp className="w-4 h-4" />
            <span className="font-semibold text-sm">{post.upvoteCount}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <Eye className="w-4 h-4" />
          <span>{post.viewCount}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
