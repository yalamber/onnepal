import Link from 'next/link';
import {
  AlignJustify, ShoppingBag, Briefcase, Calendar, MapPinned,
  Wrench, HelpCircle, MessagesSquare, ArrowRight,
} from 'lucide-react';
import { SectionHead } from '@/components/section-head';
import type { HomepageStats } from '@/lib/db/queries/homepage';

type Tone = 'teal' | 'crimson' | 'evergreen' | 'saffron';

interface Cat {
  id: keyof HomepageStats['byCategory'];
  name: string;
  sub: string;
  href: string;
  tone: Tone;
  Icon: React.ComponentType<{ size?: number }>;
  sample: string[];
}

const CATS: Cat[] = [
  { id: 'directory', name: 'Directory', sub: 'Local businesses, mapped & reviewed', tone: 'teal', Icon: AlignJustify, href: '/directory', sample: ['Newa Lahana', 'Himalayan Java', 'Bhojan Griha'] },
  { id: 'classifieds', name: 'Classifieds', sub: 'Buy, sell, rent — peer to peer', tone: 'crimson', Icon: ShoppingBag, href: '/classifieds', sample: ['Royal Enfield · Rs 4.8L', 'iPhone 14 · Rs 95k', '2BHK · Rs 28k'] },
  { id: 'jobs', name: 'Jobs', sub: 'From engineering to gigs', tone: 'evergreen', Icon: Briefcase, href: '/jobs', sample: ['Frontend Engineer', 'Barista', 'Trek Guide'] },
  { id: 'events', name: 'Events', sub: 'What’s happening this week', tone: 'saffron', Icon: Calendar, href: '/events', sample: ['Indra Jatra Walk', 'Open Mic · Patan', 'Run for Heritage'] },
  { id: 'places', name: 'Places', sub: 'Hidden gems & favorites', tone: 'teal', Icon: MapPinned, href: '/places', sample: ['Garden of Dreams', 'Champadevi Hill', 'Boudha at dawn'] },
  { id: 'pros', name: 'Pros', sub: 'Trusted local professionals', tone: 'evergreen', Icon: Wrench, href: '/pros', sample: ['Electricians', 'Tutors', 'Tailors'] },
  { id: 'lostFound', name: 'Lost & Found', sub: 'Reunite with what matters', tone: 'crimson', Icon: HelpCircle, href: '/lost-found', sample: ['Tabby cat · Boudha', 'Wallet · Thamel', 'Keys · Patan'] },
  { id: 'discussions', name: 'Discussions', sub: 'Neighborhood conversations', tone: 'saffron', Icon: MessagesSquare, href: '/discussions', sample: ['Best ISP in 2026?', 'Patan dental?', 'Weekend hike ideas'] },
];

export function CategoryGrid({ counts }: { counts: HomepageStats['byCategory'] }) {
  return (
    <section className="section">
      <SectionHead
        eyebrow="01 · Browse"
        title={<>Eight ways into<br /><em>everyday Nepal.</em></>}
        sub="Each category is a portal — moderated, mapped, and built around how people actually find things in their neighborhood."
      />
      <div className="cat-grid">
        {CATS.map((c) => (
          <Link key={c.id} href={c.href} className={`cat-card cat-${c.tone}`}>
            <div className="cat-top">
              <span className={`cat-icon cat-icon-${c.tone}`}><c.Icon size={20} /></span>
              <span className="cat-count">{counts[c.id].toLocaleString('en-US')}</span>
            </div>
            <div className="cat-mid">
              <h3 className="cat-name">{c.name}</h3>
              <p className="cat-sub">{c.sub}</p>
            </div>
            <ul className="cat-sample">
              {c.sample.map((s) => <li key={s}>· {s}</li>)}
            </ul>
            <span className="cat-arrow"><ArrowRight size={20} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
