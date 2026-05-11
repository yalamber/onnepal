import type { Metadata } from 'next';
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
  // Inline empty-state instead of notFound() — the latter currently bubbles
  // up to the worker as a 1101 exception (vinext doesn't unwrap NEXT_NOT_FOUND
  // cleanly). 200-with-friendly-page is wrong on status code but right on UX.
  if (!voice || voice.status !== 'published') return <VoiceNotFound />;

  const cover = imageUrl(voice.coverImageUrl);

  // Article JSON-LD so search engines and AI agents can extract a clean
  // citation (title, author, date, image, body). Most AI search products
  // (Perplexity, ChatGPT browsing, Google AI Overviews) prefer Article
  // schema over scraping the rendered DOM.
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: voice.title,
    description: voice.excerpt ?? voice.content.slice(0, 200),
    url: `https://onnepal.com/voices/${voice.slug}`,
    mainEntityOfPage: `https://onnepal.com/voices/${voice.slug}`,
    datePublished: voice.publishedAt ? new Date(voice.publishedAt).toISOString() : undefined,
    dateModified: new Date(voice.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: voice.authorName || voice.authorUsername || 'Anonymous',
      ...(voice.authorUsername && { url: `https://onnepal.com/profile/${voice.authorUsername}` }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'OnNepal',
      url: 'https://onnepal.com',
      logo: { '@type': 'ImageObject', url: 'https://onnepal.com/icon.svg' },
    },
    ...(cover && {
      image: {
        '@type': 'ImageObject',
        url: cover,
        ...(voice.coverCreditName && {
          creditText: voice.coverCreditName,
          creator: { '@type': 'Person', name: voice.coverCreditName, ...(voice.coverCreditUrl && { url: voice.coverCreditUrl }) },
        }),
      },
    }),
    ...(voice.category && { articleSection: voice.category }),
    ...(voice.city && { contentLocation: { '@type': 'Place', name: voice.city, addressCountry: 'NP' } }),
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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

function VoiceNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <p className="t-eyebrow justify-center mb-4"><span className="dot" /> Voice not found</p>
        <h1 className="t-display" style={{ fontSize: 44, lineHeight: 1.05 }}>
          That voice <em>has moved or doesn&rsquo;t exist.</em>
        </h1>
        <p className="text-[var(--ink-500)] mt-4">
          It may have been unpublished, or the link is from an older draft.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/voices" className="btn btn-primary">Browse all voices</Link>
          <Link href="/voices/post/new" className="btn btn-ghost">Write your own</Link>
        </div>
      </div>
    </main>
  );
}
