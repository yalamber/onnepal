'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ActivityItem, ActivityType } from '@/lib/db/queries/homepage';

type WireItem = ActivityItem & { time: string };

const TYPE_TO_PILL: Record<ActivityType, { label: string; tone: 'teal' | 'evergreen' | 'saffron' | 'crimson' }> = {
  classifieds: { label: 'Classifieds', tone: 'teal' },
  jobs: { label: 'Jobs', tone: 'evergreen' },
  events: { label: 'Events', tone: 'saffron' },
  'lost-found': { label: 'Lost & Found', tone: 'crimson' },
  pros: { label: 'Pros', tone: 'teal' },
};

const TYPE_TO_HREF: Record<ActivityType, string> = {
  classifieds: '/classifieds',
  jobs: '/jobs',
  events: '/events',
  'lost-found': '/lost-found',
  pros: '/pros',
};

export function HeroRail({ initial }: { initial: WireItem[] }) {
  const [items, setItems] = useState<WireItem[]>(initial);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch('/api/activity/recent');
        if (!res.ok) return;
        const data = (await res.json()) as { items: WireItem[] };
        if (!cancelled && Array.isArray(data.items)) setItems(data.items);
      } catch {}
    };
    const id = window.setInterval(tick, 60_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  return (
    <aside className="hero-aside">
      <div className="rail-card">
        <div className="rail-head">
          <span className="t-eyebrow">Live · now in Nepal</span>
          <span className="rail-pulse" />
        </div>
        <ul className="rail-list">
          {items.length === 0 ? (
            <li className="rail-item">
              <div className="rail-title">No activity yet — be the first to post.</div>
            </li>
          ) : (
            items.map((it) => {
              const pill = TYPE_TO_PILL[it.type];
              const href = `${TYPE_TO_HREF[it.type]}/${it.id}`;
              return (
                <li key={`${it.type}-${it.id}`} className="rail-item">
                  <div className="rail-row">
                    <span className={`pill pill-${pill.tone}`}>{pill.label}</span>
                    <span className="t-meta rail-time">{it.time}</span>
                  </div>
                  <Link href={href} className="rail-title" style={{ display: 'block' }}>
                    {it.title}
                  </Link>
                  {it.meta && <div className="t-meta">{it.meta}</div>}
                </li>
              );
            })
          )}
        </ul>
        <Link href="/search" className="rail-foot">See all activity →</Link>
      </div>
    </aside>
  );
}
