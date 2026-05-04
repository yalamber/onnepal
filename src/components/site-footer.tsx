'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';

const COLS = [
  {
    h: 'Browse',
    items: [
      { label: 'Directory', href: '/directory' },
      { label: 'Classifieds', href: '/classifieds' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'Events', href: '/events' },
      { label: 'Places', href: '/places' },
      { label: 'Pros', href: '/pros' },
      { label: 'Lost & Found', href: '/lost-found' },
      { label: 'Discussions', href: '/discussions' },
    ],
  },
  {
    h: 'For business',
    items: [
      { label: 'Claim your listing', href: '/signup' },
      { label: 'Verified Pros', href: '/pros' },
      { label: 'Featured spots', href: '/directory' },
      { label: 'Advertise', href: '/advertise' },
    ],
  },
  {
    h: 'Cities',
    items: [
      { label: 'Kathmandu', href: '/directory?city=Kathmandu' },
      { label: 'Lalitpur', href: '/directory?city=Lalitpur' },
      { label: 'Bhaktapur', href: '/directory?city=Bhaktapur' },
      { label: 'Pokhara', href: '/directory?city=Pokhara' },
      { label: 'Chitwan', href: '/directory?city=Chitwan' },
      { label: 'See all 118', href: '/directory' },
    ],
  },
  {
    h: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Press', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Trust & safety', href: '/trust' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/site/') || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="onnepal-footer" role="contentinfo">
      <div className="footer-top">
        <div>
          <Logo className="h-10" />
          <p className="footer-tag t-display">
            <em>Tapaainko aaphno bazaar.</em>
            <br />
            <span className="t-deva" style={{ fontSize: 18 }}>तपाईंको आफ्नो बजार।</span>
          </p>
          <p className="footer-blurb">
            OnNepal is built in Kathmandu, run by neighbors, for neighbors. We don&rsquo;t sell your data and we don&rsquo;t inflate listings.
          </p>
        </div>
        <div className="footer-cols">
          {COLS.map((c) => (
            <div key={c.h} className="footer-col">
              <div className="t-eyebrow">{c.h}</div>
              <ul>
                {c.items.map((i) => (
                  <li key={i.label}>
                    <Link href={i.href}>{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <div className="t-meta">© {new Date().getFullYear()} OnNepal · Kathmandu</div>
        <div className="footer-legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/community-guidelines">Community guidelines</Link>
          <Link href="/status">Status</Link>
        </div>
      </div>
    </footer>
  );
}
