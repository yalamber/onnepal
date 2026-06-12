import type { Metadata } from 'next';
import Link from 'next/link';
import { FESTIVALS, getFestivalHint, countdownLabel, kathmanduDayIso } from '@/lib/festivals';

export const metadata: Metadata = {
  title: 'Nepali Festival Calendar — dates & countdowns',
  description:
    'Upcoming Nepali festivals with dates and countdowns — Dashain, Tihar, Holi, Indra Jatra, Lhosar, Chhath and more. Updated for the current Bikram Sambat year.',
};

export const revalidate = 3600;

export default function FestivalsPage() {
  const now = new Date();
  const today = kathmanduDayIso(now);
  const hint = getFestivalHint(now, 365);

  // Upcoming first (ascending), then past (most recent first) greyed out.
  const upcoming = FESTIVALS.filter((f) => (f.endDate ?? f.date) >= today);
  const past = FESTIVALS.filter((f) => (f.endDate ?? f.date) < today).reverse();

  const daysUntil = (date: string): number => {
    const [y, m, d] = date.split('-').map(Number);
    const target = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
    const t = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
    return target - t;
  };

  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> Festivals · चाडपर्व</div>
        <h1 className="page-hero-title">The festival <em>calendar.</em></h1>
        <p className="page-hero-sub">
          Every major festival with dates and countdowns — for planning the trip home, the time
          off, or the feast. Dates follow the lunar calendar and are verified each year.
        </p>
        {hint && (
          <p className="mt-4 text-[var(--ink-700)]">
            Next up: <Link className="underline underline-offset-4 text-[var(--accent)]" href={`/festival/${hint.festival.slug}`}>
              {hint.festival.emoji} {hint.festival.name}
            </Link>{' '}
            — {countdownLabel(hint).toLowerCase()}.
          </p>
        )}
      </div>

      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 pb-24">
        <div className="today-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {upcoming.map((f) => {
            const d = daysUntil(f.date);
            const ongoing = f.date <= today && (f.endDate ?? f.date) >= today;
            return (
              <Link key={f.slug} href={`/festival/${f.slug}`} className="today-tile">
                <span className={`pill ${ongoing ? 'pill-crimson' : d <= 30 ? 'pill-saffron' : 'pill-teal'}`}>
                  {ongoing ? 'Happening now' : d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `in ${d} days`}
                </span>
                <h3 className="today-tile-title">{f.emoji} {f.name} <span className="t-deva text-[var(--ink-500)]" style={{ fontSize: '0.85em' }}>{f.nepaliName}</span></h3>
                <p className="today-tile-sub">{f.blurb}</p>
                <span className="today-tile-meta">{fmt(f.date)}{f.endDate ? ` – ${fmt(f.endDate)}` : ''}</span>
              </Link>
            );
          })}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="t-eyebrow mt-16 mb-6">Earlier this cycle</h2>
            <div className="today-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', opacity: 0.6 }}>
              {past.map((f) => (
                <Link key={f.slug} href={`/festival/${f.slug}`} className="today-tile">
                  <h3 className="today-tile-title">{f.emoji} {f.name}</h3>
                  <span className="today-tile-meta">{fmt(f.date)}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
