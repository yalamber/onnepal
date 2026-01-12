'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info } from 'lucide-react';

export default function SubmitPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, excerpt: excerpt || undefined }),
      });

      const data = (await res.json()) as { post?: { slug: string }; error?: string };

      if (res.ok && data.post) {
        router.push(`/posts/${data.post.slug}`);
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Story</CardTitle>
            <CardDescription>
              Share your experiences, observations, and stories about Nepal. Your post will be reviewed by moderators
              before publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={10}
                  maxLength={200}
                  placeholder="Enter a descriptive title for your story"
                />
                <p className="text-xs text-muted-foreground">Minimum 10 characters, maximum 200</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">
                  Excerpt (optional)
                </Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={300}
                  placeholder="A brief summary of your story (shown in post previews)"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">Maximum 300 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength={100}
                  placeholder="Tell your story... (supports Markdown)"
                  className="min-h-[400px]"
                />
                <p className="text-xs text-muted-foreground">Minimum 100 characters. Markdown formatting supported.</p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} variant="primary" className="flex-1">
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Your post will be submitted for moderation review. Once approved by our
                  moderators, it will be published and visible to the community. You&apos;ll be able to see your pending posts
                  in your dashboard.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
