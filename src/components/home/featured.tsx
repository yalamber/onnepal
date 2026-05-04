import Link from 'next/link';
import { SectionHead } from '@/components/section-head';

export function Featured() {
  return (
    <section className="section-paper">
      <div className="section-inner">
        <SectionHead
          eyebrow="02 · This week"
          title={<>Featured in<br /><em>your valley.</em></>}
          sub="Hand-picked by our local editors. New every Monday."
        />
        <div className="featured-grid">
          <Link href="/events" className="feat-card feat-lg">
            <div className="feat-img feat-img-1">
              <span className="feat-img-label">/ patan durbar at dusk</span>
            </div>
            <div className="feat-body">
              <span className="pill pill-saffron">Events · Editor’s pick</span>
              <h3 className="feat-title">Indra Jatra after-hours, mapped — the chariots, the pole-raising, the hidden chowks</h3>
              <div className="feat-meta">
                <span>By <strong>OnNepal Editors</strong></span>
                <span>·</span>
                <span>8 min read</span>
                <span>·</span>
                <span>Patan, Kathmandu</span>
              </div>
            </div>
          </Link>

          <Link href="/directory" className="feat-card">
            <div className="feat-img feat-img-2"><span className="feat-img-label">/ momo dumplings</span></div>
            <div className="feat-body">
              <span className="pill pill-teal">Directory</span>
              <h3 className="feat-title">12 momo joints worth a detour</h3>
              <div className="feat-meta"><span>Updated weekly</span></div>
            </div>
          </Link>

          <Link href="/classifieds" className="feat-card">
            <div className="feat-img feat-img-3"><span className="feat-img-label">/ flat in jhamsikhel</span></div>
            <div className="feat-body">
              <span className="pill pill-crimson">Classifieds</span>
              <h3 className="feat-title">5 light-filled flats under Rs 30k</h3>
              <div className="feat-meta"><span>3 new this week</span></div>
            </div>
          </Link>

          <Link href="/places" className="feat-card">
            <div className="feat-img feat-img-4"><span className="feat-img-label">/ trail · champadevi</span></div>
            <div className="feat-body">
              <span className="pill pill-evergreen">Places</span>
              <h3 className="feat-title">A guide to half-day hikes from the city</h3>
              <div className="feat-meta"><span>By Pratik R. · 14 stops</span></div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
