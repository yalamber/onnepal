import Link from 'next/link';
import { SectionHead } from '@/components/section-head';
import type { VoiceListItem } from '@/lib/db/queries/voices';
import { imageUrl } from '@/components/image-upload';

const TONE_BG = ['#d8b88a', '#c97a4f', '#9aafa3', '#6a8a9c'];
const TONE_PILL = ['saffron', 'crimson', 'evergreen', 'teal'] as const;

export function Featured({ voices }: { voices: VoiceListItem[] }) {
  // Always render the section. If no voices, show editorial placeholders so the homepage
  // doesn't have a hole and the user knows the feature exists.
  const hasContent = voices.length > 0;

  return (
    <section className="section-paper">
      <div className="section-inner">
        <SectionHead
          eyebrow="02 · This week"
          title={<>Voices from<br /><em>Nepal.</em></>}
          sub={
            hasContent
              ? <>Hand-picked by our local editors. <Link href="/voices" className="text-[var(--accent)] underline underline-offset-4">Browse all voices →</Link></>
              : <>Articles, essays, and guides from neighbors. <Link href="/voices/post/new" className="text-[var(--accent)] underline underline-offset-4">Be the first to publish →</Link></>
          }
        />

        {hasContent ? (
          <div className="featured-grid">
            {voices.slice(0, 4).map((v, i) => {
              const isLg = i === 0;
              const cover = imageUrl(v.coverImageUrl);
              const tone = TONE_PILL[i % TONE_PILL.length];
              return (
                <Link
                  key={v.id}
                  href={`/voices/${v.slug}`}
                  className={`feat-card ${isLg ? 'feat-lg' : ''}`}
                >
                  <div
                    className="feat-img"
                    style={{
                      backgroundColor: cover ? undefined : TONE_BG[i % TONE_BG.length],
                      backgroundImage: cover ? `url(${cover})` : undefined,
                      backgroundSize: cover ? 'cover' : undefined,
                      backgroundPosition: 'center',
                    }}
                  >
                    {!cover && (
                      <span className="feat-img-label">/ {(v.category || 'voice').toLowerCase()}{v.city ? ` · ${v.city.toLowerCase()}` : ''}</span>
                    )}
                  </div>
                  <div className="feat-body">
                    <span className={`pill pill-${tone}`}>
                      Voice{v.category ? ` · ${v.category}` : ''}
                    </span>
                    <h3 className="feat-title">{v.title}</h3>
                    <div className="feat-meta">
                      <span>By <strong>{v.authorName || v.authorUsername || 'Anonymous'}</strong></span>
                      {v.city && <><span>·</span><span>{v.city}</span></>}
                      {v.publishedAt && (
                        <><span>·</span><span>{new Date(v.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-[var(--r-lg)] border-2 border-dashed border-[var(--ink-200)] py-16 px-8 text-center"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          >
            <div className="t-eyebrow justify-center mb-4">No voices published yet</div>
            <p className="t-display" style={{ fontSize: 32 }}>
              The first <em>voice</em> goes here.
            </p>
            <p className="text-[var(--ink-500)] mt-3 max-w-md mx-auto">
              Write about your neighborhood, your favorite momo joint, a hike, an opinion &mdash; we
              feature the best of the week.
            </p>
            <Link href="/voices/post/new" className="btn btn-primary mt-6 inline-flex">
              Write the first voice →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
