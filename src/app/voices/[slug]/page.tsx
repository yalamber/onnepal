import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getVoiceBySlug } from '@/lib/db/queries/voices';
import { imageUrl } from '@/lib/image-utils';
import { SafeMarkdown } from '@/components/safe-markdown';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const db = getDb(getD1Database());
    const v = await getVoiceBySlug(db, slug);
    if (!v) return { title: 'Voice not found — OnNepal' };
    return {
      title: `${v.title} — Voices on OnNepal`,
      description: v.excerpt ?? v.content.slice(0, 160),
    };
  } catch {
    return { title: 'Voice — OnNepal' };
  }
}

export default async function VoicePage({ params }: Props) {
  const { slug } = await params;
  let voice: Awaited<ReturnType<typeof getVoiceBySlug>> = null;
  try {
    const db = getDb(getD1Database());
    voice = await getVoiceBySlug(db, slug);
  } catch (e) {
    console.error('[/voices/[slug]] failed', e);
  }
  if (!voice) notFound();
  if (voice.status !== 'published') notFound();

  const cover = imageUrl(voice.coverImageUrl);

  return (
    <main>
      <article className="page-hero">
        <div className="t-eyebrow">
          <span className="dot" /> {voice.category ? voice.category : 'Voice'}
          {voice.city ? ` · ${voice.city}` : ''}
        </div>
        <h1 className="page-hero-title" style={{ maxWidth: 900 }}>{voice.title}</h1>
        {voice.excerpt && <p className="page-hero-sub">{voice.excerpt}</p>}
        <div className="t-meta mt-4">
          By <strong className="text-[var(--ink-700)]">{voice.authorName || voice.authorUsername || 'Anonymous'}</strong>
          {voice.publishedAt ? ` · ${new Date(voice.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
        </div>
      </article>

      {cover && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="w-full rounded-[var(--r-lg)]" />
          {voice.coverCreditName && (
            <p className="t-meta mt-2 mb-12 text-[var(--ink-500)]">
              Photo by{' '}
              {voice.coverCreditUrl ? (
                <a
                  href={voice.coverCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--ink-900)] transition-colors"
                >
                  {voice.coverCreditName}
                </a>
              ) : (
                <span>{voice.coverCreditName}</span>
              )}
              {voice.coverCreditUrl?.includes('unsplash.com') && (
                <>
                  {' '}on{' '}
                  <a
                    href="https://unsplash.com/?utm_source=onnepal&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-[var(--ink-900)] transition-colors"
                  >
                    Unsplash
                  </a>
                </>
              )}
            </p>
          )}
          {!voice.coverCreditName && <div className="mb-12" />}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-8 pb-24">
        <SafeMarkdown
          content={voice.content}
          className="prose prose-lg max-w-none prose-headings:font-[var(--font-onn-display)] prose-headings:font-medium prose-headings:tracking-tight prose-a:text-[var(--accent)] prose-a:underline-offset-4 prose-img:rounded-[var(--r-md)]"
        />
        <div className="mt-12 pt-8 border-t border-[var(--ink-200)] flex items-center justify-between">
          <Link href="/voices" className="t-meta text-[var(--accent)]">← All voices</Link>
          <Link href="/voices/post/new" className="btn btn-ghost">Write your own</Link>
        </div>
      </div>
    </main>
  );
}
