import Link from 'next/link';
import type { NewsItem } from '@/lib/db/queries/daily';
import { relativeTime } from '@/lib/db/queries/homepage';

/**
 * "From the press" — top headlines from Nepali news portals inside the
 * Today band. Title + excerpt only; every headline links OUT to the source
 * portal (rel/noopener, new tab) with visible attribution. Mixed
 * English/Nepali, interleaved so neither language dominates the fold.
 */

function interleaveByLang(items: NewsItem[], take: number): NewsItem[] {
  const en = items.filter((i) => i.lang === 'en');
  const np = items.filter((i) => i.lang === 'np');
  const out: NewsItem[] = [];
  let e = 0, n = 0;
  while (out.length < take && (e < en.length || n < np.length)) {
    if (e < en.length) out.push(en[e++]);
    if (out.length < take && n < np.length) out.push(np[n++]);
  }
  return out;
}

export function NewsDigest({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;
  const shown = interleaveByLang(items, 6);

  return (
    <div className="press">
      <div className="press-head">
        <span className="t-eyebrow"><span className="dot" /> From the press</span>
        <Link href="/news" className="today-tile-meta">All headlines →</Link>
      </div>
      <ul className="press-grid">
        {shown.map((it) => (
          <li key={it.link} className="press-item">
            <a href={it.link} target="_blank" rel="noopener noreferrer">
              <div className="press-meta">
                <span className="press-source">{it.sourceName}</span>
                <span className="t-meta">{relativeTime(it.publishedAt)}</span>
              </div>
              <h4 className="press-title">{it.title}</h4>
              {it.excerpt && <p className="press-excerpt">{it.excerpt}</p>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
