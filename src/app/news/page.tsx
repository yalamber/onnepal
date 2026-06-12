import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getNews, newsIsStale, refreshNews, type NewsItem } from '@/lib/db/queries/daily';
import { relativeTime } from '@/lib/db/queries/homepage';
import { NEWS_SOURCES } from '@/lib/news-sources';

export const metadata: Metadata = {
  title: 'Nepal News — headlines from every major portal',
  description:
    'The latest headlines from OnlineKhabar, BBC Nepali, Setopati, Ratopati, Khabarhub and more — in one place. Click through to read on the source portal.',
};

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ lang?: string; source?: string }>;
}

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const lang = sp.lang === 'en' ? 'en' : sp.lang === 'np' ? 'np' : undefined;
  const source = sp.source && NEWS_SOURCES.some((s) => s.id === sp.source) ? sp.source : undefined;

  let items: NewsItem[] = [];
  try {
    const db = getDb(getD1Database());
    // SWR: refresh inline if the cache has gone stale (cron missed / cold DB).
    if (await newsIsStale(db)) {
      await refreshNews(db).catch((e) => console.error('[news] inline refresh failed', e));
    }
    items = await getNews(db, { lang, sources: source ? [source] : undefined, limit: 60 });
  } catch (e) {
    console.error('[news] failed', e);
  }

  const filters: Array<{ label: string; href: string; active: boolean }> = [
    { label: 'All', href: '/news', active: !lang && !source },
    { label: 'English', href: '/news?lang=en', active: lang === 'en' },
    { label: 'नेपाली', href: '/news?lang=np', active: lang === 'np' },
    ...NEWS_SOURCES.map((s) => ({
      label: s.name,
      href: `/news?source=${s.id}`,
      active: source === s.id,
    })),
  ];

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> News · from Nepal&rsquo;s press</div>
        <h1 className="page-hero-title">Headlines, <em>one place.</em></h1>
        <p className="page-hero-sub">
          The latest from Nepal&rsquo;s major news portals. Every headline links to the original
          story on the source&rsquo;s own site.
        </p>
      </div>

      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 pb-24">
        <div className="flex flex-wrap gap-2 mb-8" role="navigation" aria-label="Filter news">
          {filters.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`pill ${f.active ? 'pill-teal' : ''}`}
              style={f.active ? undefined : { background: 'var(--paper-2)', color: 'var(--ink-700)' }}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="rounded-[var(--r-lg)] border-2 border-dashed border-[var(--ink-200)] py-16 px-8 text-center">
            <p className="t-display" style={{ fontSize: 28 }}>No headlines yet.</p>
            <p className="text-[var(--ink-500)] mt-2">The news cache is warming up — check back in a minute.</p>
          </div>
        ) : (
          <ul className="news-list">
            {items.map((it) => (
              <li key={it.link} className="news-row">
                <a href={it.link} target="_blank" rel="noopener noreferrer">
                  <div className="press-meta">
                    <span className="press-source">{it.sourceName}</span>
                    {it.category && <span className="t-meta">{it.category}</span>}
                    <span className="t-meta">{relativeTime(it.publishedAt)}</span>
                  </div>
                  <h3 className="news-row-title">{it.title}</h3>
                  {it.excerpt && <p className="press-excerpt">{it.excerpt}</p>}
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="t-meta mt-12 max-w-2xl">
          OnNepal aggregates headlines and short excerpts via each portal&rsquo;s public RSS feed.
          Full stories, photographs, and reporting belong to the respective publishers — click any
          headline to read at the source.
        </p>
      </div>
    </main>
  );
}
