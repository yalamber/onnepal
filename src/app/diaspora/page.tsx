import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getNumbers, getNews, type NewsItem, type NumbersSnapshot } from '@/lib/db/queries/daily';
import { getPublishedVoices, type VoiceListItem } from '@/lib/db/queries/voices';
import { getFestivalHint, countdownLabel } from '@/lib/festivals';
import { bsToday } from '@/lib/bs-date';
import { DIASPORA_CITIES } from '@/lib/nepal-cities';
import { NepalNumbers } from '@/components/home/nepal-numbers';
import { NewsDigest } from '@/components/home/news-digest';

export const metadata: Metadata = {
  title: 'Nepali Diaspora Hub — your thread back home',
  description:
    'For Nepalis abroad: today\'s NPR exchange rate, gold price, festival countdowns, news from home, guides for consular processes, and Nepali community pages for Doha, Dubai, Kuala Lumpur, London, Sydney, New York and more.',
};

export const revalidate = 300;

export default async function DiasporaPage() {
  const now = new Date();
  const db = getDb(getD1Database());

  const [numbersSnap, news, guides] = await Promise.all([
    getNumbers(db).catch((e) => { console.error('[diaspora] numbers failed', e); return null as NumbersSnapshot | null; }),
    // English headlines read better abroad; नेपाली is one click away on /news.
    getNews(db, { lang: 'en', limit: 6 }).catch((e) => { console.error('[diaspora] news failed', e); return [] as NewsItem[]; }),
    getPublishedVoices(db, { category: 'Guide', limit: 6 }).catch((e) => { console.error('[diaspora] guides failed', e); return [] as VoiceListItem[]; }),
  ]);

  const bs = bsToday(now);
  const festival = getFestivalHint(now);

  // Group diaspora cities by region for scannability.
  const regions: Array<{ label: string; countries: string[] }> = [
    { label: 'Gulf', countries: ['Qatar', 'UAE', 'Saudi Arabia', 'Kuwait', 'Oman', 'Bahrain'] },
    { label: 'Asia-Pacific', countries: ['Malaysia', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'India'] },
    { label: 'Europe', countries: ['UK', 'Portugal'] },
    { label: 'Americas', countries: ['USA', 'Canada'] },
    { label: 'Australia', countries: ['Australia'] },
  ];

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> Diaspora · विदेशमा रहनुभएका नेपालीहरूका लागि</div>
        <h1 className="page-hero-title">Your thread <em>back home.</em></h1>
        <p className="page-hero-sub">
          The rupee rate before you send money. The festival countdown before you book the
          flight. News from home, guides for paperwork, and the Nepali community in your city.
        </p>
        {bs && (
          <p className="t-meta mt-4">
            Today in Nepal: <span className="t-deva text-[var(--ink-700)]">{bs.np}</span>
            {festival && (
              <> · {festival.festival.emoji} <Link href={`/festival/${festival.festival.slug}`} className="underline underline-offset-4 text-[var(--accent)]">{festival.festival.name}</Link> {countdownLabel(festival).toLowerCase()}</>
            )}
          </p>
        )}
      </div>

      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 pb-24 space-y-16">
        {/* The numbers that matter to remitters */}
        <section>
          <h2 className="t-eyebrow mb-4">Today&rsquo;s numbers</h2>
          <NepalNumbers snapshot={numbersSnap} bs={bs} />
          <p className="t-meta mt-2">
            Forex: Nepal Rastra Bank official rates · Gold: FENEGOSIDA · Updated through the day.
          </p>
        </section>

        {/* Community pages by region */}
        <section>
          <h2 className="t-eyebrow mb-2">Your city&rsquo;s Nepali community</h2>
          <p className="text-[var(--ink-500)] text-sm mb-6 max-w-xl">
            Events, rooms, Nepali businesses, and classifieds where you live. Pick your city —
            then post what&rsquo;s happening there.
          </p>
          <div className="space-y-8">
            {regions.map((region) => {
              const cities = DIASPORA_CITIES.filter((c) => region.countries.includes(c.country));
              if (!cities.length) return null;
              return (
                <div key={region.label}>
                  <h3 className="t-meta mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{region.label}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {cities.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/city/${c.slug}`} className="btn btn-ghost" style={{ fontSize: 14 }}>
                          {c.flag} {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Guides */}
        {guides.length > 0 && (
          <section>
            <h2 className="t-eyebrow mb-2">Paperwork & process guides</h2>
            <p className="text-[var(--ink-500)] text-sm mb-6 max-w-xl">
              Passport renewal, police clearance, sending money — written step by step, with
              links to the official sources. Always verify with the embassy before you act.
            </p>
            <div className="today-grid">
              {guides.map((g) => (
                <Link key={g.id} href={`/voices/${g.slug}`} className="today-tile">
                  <span className="pill pill-teal">Guide</span>
                  <h3 className="today-tile-title">{g.title}</h3>
                  {g.excerpt && <p className="today-tile-sub">{g.excerpt}</p>}
                  <span className="today-tile-meta">Read the guide →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* News from home */}
        <section>
          <NewsDigest items={news} />
        </section>

        {/* Festival CTA */}
        {festival && (
          <section className="rounded-[var(--r-lg)] border border-[var(--ink-200)] p-8 flex flex-wrap items-center justify-between gap-4" style={{ background: 'linear-gradient(120deg, var(--saffron-100), transparent)' }}>
            <div>
              <h2 className="t-display" style={{ fontSize: 26 }}>
                {festival.festival.emoji} {festival.festival.name} is {countdownLabel(festival).toLowerCase()}.
              </h2>
              <p className="text-[var(--ink-500)] mt-1">
                Hosting a {festival.festival.name} gathering in your city? Post it so Nepalis near you can find it.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/festival/${festival.festival.slug}`} className="btn btn-ghost">About the festival</Link>
              <Link href="/events/post/new" className="btn btn-primary">Post an event →</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
