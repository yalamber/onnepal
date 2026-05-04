import { SectionHead } from '@/components/section-head';

const QUOTES = [
  { name: 'Anjali Shrestha', role: 'Cafe owner · Jhamsikhel', body: 'Half my weekend traffic now finds us through OnNepal. The map is the most accurate thing on the internet for Patan.' },
  { name: 'Bibek Karki', role: 'Engineer · Kathmandu', body: 'Found my flat, my mechanic, and weekly badminton games here. It replaced four group chats.' },
  { name: 'Sushma Lama', role: 'Trek guide · Pokhara', body: 'Bookings tripled after I got verified. The reviews actually mean something because they’re from neighbors.' },
];

export function Community() {
  return (
    <section className="section-ink">
      <div className="section-inner">
        <SectionHead
          eyebrow="04 · Voices"
          title={<>From the<br /><em>neighborhood.</em></>}
          sub="A platform is only as good as the people on it."
          invert
        />
        <div className="quote-grid">
          {QUOTES.map((q) => (
            <figure key={q.name} className="quote-card">
              <blockquote>&ldquo;{q.body}&rdquo;</blockquote>
              <figcaption>
                <div className="q-avatar" />
                <div>
                  <div className="q-name">{q.name}</div>
                  <div className="t-meta q-role">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
