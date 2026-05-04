import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHead } from '@/components/section-head';

const CITIES = [
  { name: 'Kathmandu', sub: 'Capital · 1.4M', listings: '18,420', wards: 32 },
  { name: 'Lalitpur', sub: 'Patan · 230k', listings: '6,210', wards: 18 },
  { name: 'Bhaktapur', sub: 'Heritage · 110k', listings: '2,840', wards: 12 },
  { name: 'Pokhara', sub: 'Lakeside · 480k', listings: '4,930', wards: 26 },
  { name: 'Chitwan', sub: 'Bharatpur · 320k', listings: '2,100', wards: 21 },
  { name: 'Biratnagar', sub: 'East · 240k', listings: '1,840', wards: 19 },
  { name: 'Butwal', sub: 'West · 138k', listings: '1,260', wards: 15 },
  { name: 'Janakpur', sub: 'Mithila · 158k', listings: '980', wards: 14 },
];

export function Neighborhoods() {
  return (
    <section className="section">
      <SectionHead
        eyebrow="03 · Where you are"
        title={<>From valley<br />to <em>foothills.</em></>}
        sub="Pick your city and we narrow everything — listings, jobs, events, even the discussions — to your block."
      />
      <div className="city-grid">
        {CITIES.map((c) => (
          <Link key={c.name} href={`/directory?city=${encodeURIComponent(c.name)}`} className="city-card">
            <div className="city-top">
              <span className="city-name">{c.name}</span>
              <span className="city-arrow"><ArrowRight size={18} /></span>
            </div>
            <div className="t-meta">{c.sub}</div>
            <div className="city-stats">
              <div><strong>{c.listings}</strong><span> listings</span></div>
              <div><strong>{c.wards}</strong><span> wards</span></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
