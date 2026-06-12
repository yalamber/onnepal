import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { FESTIVALS, type Festival } from '@/lib/festivals';
import { getEvents } from '@/lib/db/queries/events';
import { getPublishedVoices, type VoiceListItem } from '@/lib/db/queries/voices';

/**
 * Festival hub page: countdown + blurb + related events and voices, matched
 * by the festival's keyword list. Evergreen SEO surface — "dashain 2083
 * date" style queries land here.
 */

interface Props { params: Promise<{ slug: string }> }

function findFestival(slug: string): Festival | null {
  return FESTIVALS.find((f) => f.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = findFestival(slug);
  if (!f) return { title: 'Festival — OnNepal' };
  const dateLabel = new Date(`${f.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return {
    title: `${f.name} (${f.nepaliName}) — date, countdown & events`,
    description: `${f.name} falls on ${dateLabel}. ${f.blurb} See related events and local guides on OnNepal.`,
  };
}

export const revalidate = 3600;

export default async function FestivalPage({ params }: Props) {
  const { slug } = await params;
  const festival = findFestival(slug);
  if (!festival) return <FestivalNotFound />;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const start = festival.date;
  const end = festival.endDate ?? festival.date;
  const isOngoing = start <= today && end >= today;
  const isPast = end < today;
  const [y, m, d] = start.split('-').map(Number);
  const daysUntil =
    Math.floor(Date.UTC(y, m - 1, d) / 86_400_000) -
    Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);

  // Related content: first keyword that yields hits wins for events; voices
  // matched the same way. Both capped small — this is a hub, not a dump.
  let relatedEvents: Awaited<ReturnType<typeof getEvents>> = [];
  let relatedVoices: VoiceListItem[] = [];
  try {
    const db = getDb(getD1Database());
    for (const kw of festival.keywords) {
      if (relatedEvents.length === 0) {
        relatedEvents = await getEvents(db, { search: kw, page: 1, limit: 6 }).catch(() => []);
      }
      if (relatedVoices.length === 0) {
        relatedVoices = await getPublishedVoices(db, { search: kw, limit: 4 }).catch(() => []);
      }
      if (relatedEvents.length && relatedVoices.length) break;
    }
  } catch (e) {
    console.error('[festival] related content failed', e);
  }

  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  const countdown = isOngoing
    ? 'Happening now'
    : isPast
      ? 'This cycle has passed — dates for next year coming soon'
      : daysUntil === 0
        ? 'Today'
        : daysUntil === 1
          ? 'Tomorrow'
          : `${daysUntil} days to go`;

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: festival.name,
    alternateName: festival.nepaliName,
    description: festival.blurb,
    startDate: festival.date,
    ...(festival.endDate && { endDate: festival.endDate }),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Country', name: 'Nepal' },
    url: `https://onnepal.com/festival/${festival.slug}`,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />

      <div className="page-hero">
        <div className="t-eyebrow">
          <span className="dot" /> Festival · <Link href="/festivals" className="hover:text-[var(--accent)]">चाडपर्व calendar</Link>
        </div>
        <h1 className="page-hero-title">
          {festival.emoji} {festival.name}{' '}
          <em className="t-deva" style={{ fontSize: '0.65em' }}>{festival.nepaliName}</em>
        </h1>
        <p className="page-hero-sub">{festival.blurb}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className={`pill ${isOngoing ? 'pill-crimson' : 'pill-saffron'}`} style={{ fontSize: 12, padding: '6px 14px' }}>
            {countdown}
          </span>
          <span className="text-[var(--ink-700)]">
            {fmt(festival.date)}{festival.endDate ? ` — ${fmt(festival.endDate)}` : ''}
          </span>
        </div>
      </div>

      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 pb-24 space-y-16">
        {relatedEvents.length > 0 && (
          <section>
            <h2 className="t-eyebrow mb-6">Events around {festival.name}</h2>
            <div className="today-grid">
              {relatedEvents.map((ev) => (
                <Link key={ev.id} href={`/events/${ev.id}`} className="today-tile">
                  <span className="pill pill-saffron">{ev.category}</span>
                  <h3 className="today-tile-title">{ev.title}</h3>
                  <p className="today-tile-sub">{[ev.venue, ev.city].filter(Boolean).join(' · ')}</p>
                  <span className="today-tile-meta">{ev.startDate}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedVoices.length > 0 && (
          <section>
            <h2 className="t-eyebrow mb-6">Reading from the neighborhood</h2>
            <div className="today-grid">
              {relatedVoices.map((v) => (
                <Link key={v.id} href={`/voices/${v.slug}`} className="today-tile">
                  <span className="pill pill-evergreen">Voice{v.category ? ` · ${v.category}` : ''}</span>
                  <h3 className="today-tile-title">{v.title}</h3>
                  {v.excerpt && <p className="today-tile-sub">{v.excerpt}</p>}
                  <span className="today-tile-meta">Read →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[var(--r-lg)] border border-[var(--ink-200)] p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="t-display" style={{ fontSize: 26 }}>Hosting something for {festival.name}?</h2>
            <p className="text-[var(--ink-500)] mt-1">Post your event and it&rsquo;ll appear here and on the events calendar.</p>
          </div>
          <Link href="/events/post/new" className="btn btn-primary">Post an event →</Link>
        </section>
      </div>
    </main>
  );
}

function FestivalNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <p className="t-eyebrow justify-center mb-4"><span className="dot" /> Festival not found</p>
        <h1 className="t-display" style={{ fontSize: 44 }}>That festival <em>isn&rsquo;t in our calendar.</em></h1>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/festivals" className="btn btn-primary">See the festival calendar</Link>
        </div>
      </div>
    </main>
  );
}
