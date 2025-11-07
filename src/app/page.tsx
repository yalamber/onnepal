import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getFeaturedPosts } from '@/lib/db/queries/posts';
import { PostCard } from '@/components/posts/post-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Shield, ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const d1 = await getD1Database();
  const db = getDb(d1);

  const featuredPosts = await getFeaturedPosts(db, 6);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:40px_40px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-slate-700">
                Community-Powered Journalism
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-orange-900 to-red-900 bg-clip-text text-transparent leading-tight">
              Stories from Nepal,
              <br />
              by Nepali
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              A citizen journalism platform where your voice matters. Share stories, upvote what resonates, and shape the narrative of Nepal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto gap-2 text-base font-semibold"
                >
                  Share Your Story
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/posts">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base font-semibold"
                >
                  Browse Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="bg-white border-t-2 border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Featured Stories
              </h2>
              <p className="text-slate-600">
                Top stories selected by the community
              </p>
            </div>
            <Link href="/posts" className="hidden sm:block">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

        {featuredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No featured posts yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Be the first to share your story and make it to the homepage!
            </p>
            <Link href="/submit">
              <Button variant="primary">Submit a Post</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map(({ post, author }) => (
              <PostCard key={post.id} post={post} author={author} />
            ))}
          </div>
        )}

          <Link href="/posts" className="sm:hidden mt-8 block">
            <Button variant="outline" className="w-full gap-2">
              View All Stories
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 border-t-2 border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How OnNepal Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A transparent, community-driven platform built for authentic storytelling
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Share Your Story</h3>
              <p className="text-slate-600 leading-relaxed">
                Every voice matters. Write about what you see, experience, and care about in Nepal. Your perspective helps shape the conversation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community Driven</h3>
              <p className="text-slate-600 leading-relaxed">
                Upvote the stories that matter to you. The community decides what gets featured on the homepage through democratic voting.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Moderated & Safe</h3>
              <p className="text-slate-600 leading-relaxed">
                All posts are reviewed by moderators to ensure quality and appropriateness before publication, maintaining a safe space for all.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Share Your Voice?
            </h2>
            <p className="text-xl text-white/95 mb-8 max-w-2xl mx-auto">
              Join our community of citizen journalists and make a difference.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl font-semibold gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
