import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPublishedVoices } from '@/lib/db/queries/voices';
import { imageUrl } from '@/lib/image-utils';

export const metadata: Metadata = {
  title: 'Voices — OnNepal',
  description: 'Articles, essays, and guides written by Nepal residents — neighborhood by neighborhood.',
};

function relativeDate(ms: number | null): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function VoicesPage({ searchParams }: { searchParams: Promise<{ city?: string; category?: string; q?: string }> }) {
  const { city, category, q } = await searchParams;
  let items: Awaited<ReturnType<typeof getPublishedVoices>> = [];
  try {
    const db = getDb(getD1Database());
    items = await getPublishedVoices(db, { city, category, search: q, limit: 24 });
  } catch (e) {
    console.error('[/voices] failed', e);
  }

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> Voices · written from the gully</div>
        <h1 className="page-hero-title">Voices from <em>Nepal.</em></h1>
        <p className="page-hero-sub">
          Essays, guides, and neighborhood reports written by people who live here. Submit yours
          and we&rsquo;ll feature the best of the week on the homepage.
        </p>
        <div className="mt-6">
          <Link href="/voices/post/new" className="btn btn-primary">Write a voice →</Link>
        </div>
      </div>

      <div className="page-shell pb-24">
        {items.length === 0 ? (
          <div className="border border-dashed border-[var(--ink-200)] rounded-[var(--r-lg)] p-10 text-center">
            <div className="t-eyebrow justify-center mb-3">No voices yet</div>
            <p className="text-[var(--ink-500)]">Be the first to publish &mdash; <Link href="/voices/post/new" className="text-[var(--accent)] underline underline-offset-4">write a voice</Link>.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((v) => (
              <li key={v.id}>
                <Link href={`/voices/${v.slug}`} className="block group">
                  <div
                    className="aspect-[16/10] rounded-[var(--r-lg)] mb-4 bg-[var(--paper-2)] border border-[var(--ink-200)] overflow-hidden"
                    style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 6px, rgba(15,20,25,0.05) 6px 7px)', backgroundSize: '8px 8px' }}
                  >
                    {v.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl(v.coverImageUrl) ?? ''}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {v.category && <span className="pill pill-saffron">{v.category}</span>}
                  <h3 className="t-display mt-3" style={{ fontSize: 22, lineHeight: 1.2 }}>{v.title}</h3>
                  {v.excerpt && <p className="text-sm text-[var(--ink-500)] mt-2 line-clamp-2">{v.excerpt}</p>}
                  <div className="t-meta mt-3">
                    {v.authorName || v.authorUsername || 'Anonymous'}
                    {v.city ? ` · ${v.city}` : ''}
                    {v.publishedAt ? ` · ${relativeDate(v.publishedAt)}` : ''}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {(city || category || q) && (
          <p className="t-meta mt-8">
            Filters: {[city && `city=${city}`, category && `category=${category}`, q && `q=${q}`].filter(Boolean).join(' · ')} ·{' '}
            <Link href="/voices" className="text-[var(--accent)] underline underline-offset-4">clear</Link>
          </p>
        )}
      </div>
    </main>
  );
}
