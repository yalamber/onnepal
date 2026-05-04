import Link from 'next/link';
import { SectionHead } from '@/components/section-head';
import type { VoiceListItem } from '@/lib/db/queries/voices';

export function Community({ voices }: { voices: VoiceListItem[] }) {
  if (voices.length === 0) return null;

  return (
    <section className="section-ink">
      <div className="section-inner">
        <SectionHead
          eyebrow="04 · From the neighborhood"
          title={<>Latest<br /><em>voices.</em></>}
          sub={<>Fresh writing from across the valley. <Link href="/voices" className="text-[var(--accent-soft)] underline underline-offset-4">All voices →</Link></>}
          invert
        />
        <div className="quote-grid">
          {voices.slice(0, 3).map((v) => (
            <Link key={v.id} href={`/voices/${v.slug}`} className="quote-card group" style={{ display: 'block' }}>
              {v.category && <span className="pill pill-saffron mb-3" style={{ display: 'inline-flex' }}>{v.category}</span>}
              <blockquote style={{ marginBottom: 16 }}>{v.title}</blockquote>
              {v.excerpt && (
                <p className="text-sm" style={{ color: 'var(--ink-300)', lineHeight: 1.5, marginBottom: 16 }}>
                  {v.excerpt}
                </p>
              )}
              <figcaption>
                <div className="q-avatar" />
                <div>
                  <div className="q-name">{v.authorName || v.authorUsername || 'Anonymous'}</div>
                  <div className="t-meta q-role">
                    {v.city ? `${v.city}` : 'Nepal'}
                    {v.publishedAt ? ` · ${new Date(v.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </div>
                </div>
              </figcaption>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
