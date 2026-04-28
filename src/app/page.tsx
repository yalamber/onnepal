import Link from 'next/link';
import { Search, ShoppingBag, Briefcase, CalendarDays, HelpCircle, Store } from 'lucide-react';
import { SubdomainChecker } from '@/components/subdomain-checker';
import { AnimateIn } from '@/components/animate-in';
import { CATEGORIES } from '@/lib/categories';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import { LOST_FOUND_CATEGORIES } from '@/lib/lost-found-categories';

const STAGGER = ['animate-fade-up', 'animate-fade-up-delay-1', 'animate-fade-up-delay-2', 'animate-fade-up-delay-3', 'animate-fade-up-delay-4', 'animate-fade-up-delay-5'] as const;

const FEATURES = [
  { href: '/directory', icon: Search, label: 'Directory', desc: 'Find local businesses' },
  { href: '/classifieds', icon: ShoppingBag, label: 'Classifieds', desc: 'Buy, sell & rent' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs', desc: 'Find or post jobs' },
  { href: '/events', icon: CalendarDays, label: 'Events', desc: "What's happening" },
  { href: '/lost-found', icon: HelpCircle, label: 'Lost & Found', desc: 'Help your community' },
  { href: '/create-business', icon: Store, label: 'Business page', desc: 'Get yourname.onnepal.com' },
] as const;

export default function HomePage() {
  return (
    <main>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-gray-950 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
        Skip to content
      </a>

      {/* Hero */}
      <section id="main-content" className="pt-24 sm:pt-32 pb-16 sm:pb-20" aria-label="Hero">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="animate-fade-up text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-950 tracking-tight leading-[1.08]">
            Everything local.
            <br />
            <span className="text-gray-300">One place.</span>
          </h1>
          <p className="animate-fade-up-delay-1 mt-6 text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed">
            Businesses, classifieds, jobs, events, and more — Nepal&apos;s platform for your neighborhood.
          </p>
        </div>
      </section>

      {/* Quick access grid */}
      <section className="pb-16 sm:pb-20" aria-label="Explore">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Main features">
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FEATURES.map(({ href, icon: Icon, label, desc }, i) => (
                <li key={href} className={STAGGER[i]}>
                  <Link href={href} className="group h-full flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-950 transition-colors mb-2.5" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-950">{label}</span>
                    <span className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Business pitch — moved up */}
      <section className="py-16 sm:py-20 bg-gray-950 text-white" aria-labelledby="pitch-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <AnimateIn>
              <h2 id="pitch-heading" className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                Your business deserves more than a Facebook page.
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Get a real web presence in minutes — your own subdomain, products, menu, gallery, reviews, and contact info.
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-semibold text-white">Your own URL</dt>
                  <dd className="text-sm text-gray-400 mt-0.5">yourshop.onnepal.com</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-white">All your links</dt>
                  <dd className="text-sm text-gray-400 mt-0.5">Social, WhatsApp, maps</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-white">Products &amp; menu</dt>
                  <dd className="text-sm text-gray-400 mt-0.5">Photos, prices, availability</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-white">Up to 5 businesses</dt>
                  <dd className="text-sm text-gray-400 mt-0.5">One account, many pages</dd>
                </div>
              </dl>
            </AnimateIn>
            <AnimateIn delay={0.15} className="mt-10 lg:mt-0">
              <SubdomainChecker variant="dark" />
              <p className="mt-3 text-xs text-gray-500">Free. No credit card. Takes 5 minutes.</p>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Directory categories */}
      <section className="py-16 sm:py-20" aria-labelledby="directory-heading">
        <AnimateIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 id="directory-heading" className="text-lg font-semibold text-gray-950">Business directory</h2>
            <Link href="/directory" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3" role="list">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/directory/${cat.slug}`} className="group py-0.5 inline-flex items-baseline gap-1">
                  <span className="text-[0.9375rem] text-gray-600 group-hover:text-gray-950 transition-colors">{cat.name}</span>
                  <span className="text-xs text-gray-300">{cat.subcategories.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </AnimateIn>
      </section>

      {/* Classifieds categories */}
      <section className="py-16 sm:py-20 bg-gray-50" aria-labelledby="classifieds-heading">
        <AnimateIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 id="classifieds-heading" className="text-lg font-semibold text-gray-950">Classifieds</h2>
            <Link href="/classifieds" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3" role="list">
            {CLASSIFIED_CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/classifieds/${cat.slug}`} className="group py-0.5 inline-flex items-baseline gap-1">
                  <span className="text-[0.9375rem] text-gray-600 group-hover:text-gray-950 transition-colors">{cat.name}</span>
                  <span className="text-xs text-gray-300">{cat.subcategories.length}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/classifieds/post/new" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              Post a free ad &rarr;
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* Jobs, Events, Lost & Found */}
      <section className="py-16 sm:py-20" aria-label="More sections">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-12">
            <AnimateIn>
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-950">Jobs</h2>
                <Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
                  View all &rarr;
                </Link>
              </div>
              <ul className="flex flex-col gap-2" role="list">
                {JOB_CATEGORIES.slice(0, 8).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/jobs?category=${cat.slug}`} className="text-[0.9375rem] text-gray-600 hover:text-gray-950 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/jobs/post/new" className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-950 transition-colors">
                Post a job &rarr;
              </Link>
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-950">Events</h2>
                <Link href="/events" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
                  View all &rarr;
                </Link>
              </div>
              <ul className="flex flex-col gap-2" role="list">
                {EVENT_CATEGORIES.slice(0, 8).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/events?category=${cat.slug}`} className="text-[0.9375rem] text-gray-600 hover:text-gray-950 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/events/post/new" className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-950 transition-colors">
                Post an event &rarr;
              </Link>
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-950">Lost &amp; Found</h2>
                <Link href="/lost-found" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
                  View all &rarr;
                </Link>
              </div>
              <ul className="flex flex-col gap-2" role="list">
                {LOST_FOUND_CATEGORIES.slice(0, 8).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/lost-found?category=${cat.slug}`} className="text-[0.9375rem] text-gray-600 hover:text-gray-950 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/lost-found/post/new" className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-950 transition-colors">
                Post a listing &rarr;
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100" role="contentinfo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-950">OnNepal</p>
              <p className="text-sm text-gray-400 mt-1">Everything local. One place.</p>
            </div>
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                <li><Link href="/directory" className="hover:text-gray-950 transition-colors">Directory</Link></li>
                <li><Link href="/classifieds" className="hover:text-gray-950 transition-colors">Classifieds</Link></li>
                <li><Link href="/jobs" className="hover:text-gray-950 transition-colors">Jobs</Link></li>
                <li><Link href="/events" className="hover:text-gray-950 transition-colors">Events</Link></li>
                <li><Link href="/lost-found" className="hover:text-gray-950 transition-colors">Lost &amp; Found</Link></li>
                <li><Link href="/signup" className="hover:text-gray-950 transition-colors">Sign up</Link></li>
              </ul>
            </nav>
          </div>
          <p className="mt-8 text-xs text-gray-300">&copy; {new Date().getFullYear()} OnNepal</p>
        </div>
      </footer>
    </main>
  );
}
