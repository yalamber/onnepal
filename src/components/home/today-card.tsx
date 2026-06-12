import Link from 'next/link';
import type { TodayDigest } from '@/lib/db/queries/today';
import { countdownLabel } from '@/lib/festivals';

/**
 * "Today in Nepal" — the daily homepage card. Server-rendered from
 * getTodayDigest(). Designed to give regular visitors a reason to open the
 * app daily: a festival countdown, a fresh read, today's pulse, the next
 * event, and a good-deed nudge.
 *
 * Degrades gracefully: any tile whose data is missing is simply omitted.
 * If literally nothing is available we render nothing at all.
 */
export function TodayCard({
  digest,
  numbersSlot,
  newsSlot,
}: {
  digest: TodayDigest;
  /** Optional "Nepal Numbers" strip rendered under the band header. */
  numbersSlot?: React.ReactNode;
  /** Optional "From the press" digest rendered after the tiles. */
  newsSlot?: React.ReactNode;
}) {
  const { festival, voice, nextEvent, lostItem, newListings24h, hotCategory, dateLabel, city } = digest;

  const tiles: React.ReactNode[] = [];

  // Today's read
  if (voice) {
    tiles.push(
      <Link key="voice" href={`/voices/${voice.slug}`} className="today-tile">
        <span className="pill pill-evergreen">Today’s read</span>
        <h3 className="today-tile-title">{voice.title}</h3>
        {voice.excerpt && <p className="today-tile-sub">{voice.excerpt}</p>}
        <span className="today-tile-meta">
          {voice.authorName ? `By ${voice.authorName}` : 'Voices'}
          {voice.city ? ` · ${voice.city}` : ''}
        </span>
      </Link>,
    );
  }

  // Today's pulse — new listings
  if (newListings24h > 0) {
    const catHref = hotCategory
      ? `/classifieds?search=${encodeURIComponent(hotCategory)}`
      : '/classifieds';
    tiles.push(
      <Link key="pulse" href={catHref} className="today-tile">
        <span className="pill pill-teal">Today’s pulse</span>
        <h3 className="today-tile-title">
          {newListings24h} new {newListings24h === 1 ? 'listing' : 'listings'}
          {city ? ` in ${city}` : ''}
        </h3>
        <p className="today-tile-sub">
          {hotCategory ? `${hotCategory} is hot right now.` : 'Fresh on the marketplace in the last 24 hours.'}
        </p>
        <span className="today-tile-meta">Browse classifieds →</span>
      </Link>,
    );
  }

  // Next event
  if (nextEvent) {
    const when =
      nextEvent.daysUntil == null
        ? null
        : nextEvent.daysUntil <= 0
          ? 'Today'
          : nextEvent.daysUntil === 1
            ? 'Tomorrow'
            : `in ${nextEvent.daysUntil} days`;
    tiles.push(
      <Link key="event" href={`/events/${nextEvent.id}`} className="today-tile">
        <span className="pill pill-saffron">Next up{when ? ` · ${when}` : ''}</span>
        <h3 className="today-tile-title">{nextEvent.title}</h3>
        <p className="today-tile-sub">
          {[nextEvent.venue, nextEvent.city].filter(Boolean).join(' · ') || 'See details'}
        </p>
        <span className="today-tile-meta">View event →</span>
      </Link>,
    );
  }

  // Good deed — lost item
  if (lostItem) {
    tiles.push(
      <Link key="lost" href={`/lost-found/post/${lostItem.id}`} className="today-tile">
        <span className="pill pill-crimson">Help reunite</span>
        <h3 className="today-tile-title">{lostItem.title}</h3>
        <p className="today-tile-sub">
          Lost{lostItem.city ? ` in ${lostItem.city}` : ''} — seen it? Help return it.
        </p>
        <span className="today-tile-meta">See the post →</span>
      </Link>,
    );
  }

  // If there's nothing at all to show, render nothing.
  if (!festival && tiles.length === 0 && !numbersSlot && !newsSlot) return null;

  return (
    <section className="today-band">
      <div className="today-inner">
        <header className="today-head">
          <div className="t-eyebrow">
            <span className="dot" /> Today {city ? `in ${city}` : 'in Nepal'} · {dateLabel}
          </div>
          <span className="today-refresh">Refreshes daily</span>
        </header>

        {numbersSlot}

        {festival && (
          <Link href={`/festival/${festival.festival.slug}`} className="today-festival">
            <span className="today-festival-emoji" aria-hidden>{festival.festival.emoji}</span>
            <div className="today-festival-body">
              <span className={`pill ${festival.isOngoing ? 'pill-crimson' : 'pill-saffron'}`}>
                {festival.isOngoing ? 'Happening now' : `Coming up · ${countdownLabel(festival)}`}
              </span>
              <h2 className="today-festival-title">
                {festival.festival.name}{' '}
                <span className="today-festival-deva">{festival.festival.nepaliName}</span>
              </h2>
              <p className="today-festival-blurb">{festival.festival.blurb}</p>
              <span className="today-tile-meta">About the festival →</span>
            </div>
          </Link>
        )}

        {tiles.length > 0 && <div className="today-grid">{tiles}</div>}

        {newsSlot}
      </div>
    </section>
  );
}
