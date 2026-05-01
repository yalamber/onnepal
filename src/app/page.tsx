import Link from 'next/link';
import { Search, ShoppingBag, Briefcase, CalendarDays, HelpCircle, Store, ArrowRight, Compass, MessageSquare, Wrench } from 'lucide-react';
import { SubdomainChecker } from '@/components/subdomain-checker';
import { Logo } from '@/components/logo';
import { AnimateIn } from '@/components/animate-in';
import { CATEGORIES } from '@/lib/categories';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import { LOST_FOUND_CATEGORIES } from '@/lib/lost-found-categories';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import { PLACE_CATEGORIES } from '@/lib/place-categories';
import { DISCUSSION_CATEGORIES } from '@/lib/discussion-categories';

const STAGGER = ['animate-fade-up', 'animate-fade-up-delay-1', 'animate-fade-up-delay-2', 'animate-fade-up-delay-3', 'animate-fade-up-delay-4', 'animate-fade-up-delay-5', 'animate-fade-up-delay-5', 'animate-fade-up-delay-5'] as const;

const FEATURES = [
  { href: '/directory', icon: Search, label: 'Directory', desc: 'Find local businesses' },
  { href: '/classifieds', icon: ShoppingBag, label: 'Classifieds', desc: 'Buy, sell & rent' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs', desc: 'Find or post jobs' },
  { href: '/events', icon: CalendarDays, label: 'Events', desc: "What's happening" },
  { href: '/places', icon: Compass, label: 'Places', desc: 'Explore hidden gems' },
  { href: '/pros', icon: Wrench, label: 'Pros', desc: 'Find local professionals' },
  { href: '/lost-found', icon: HelpCircle, label: 'Lost & Found', desc: 'Help your community' },
  { href: '/discussions', icon: MessageSquare, label: 'Discussions', desc: 'Community forum' },
] as const;

const SECTIONS = [
  {
    key: 'jobs',
    icon: Briefcase,
    title: 'Jobs',
    desc: 'Find opportunities or hire talent across Nepal',
    href: '/jobs',
    postHref: '/jobs/post/new',
    postLabel: 'Post a job',
    categories: JOB_CATEGORIES,
    categoryParam: 'category',
    basePath: '/jobs',
  },
  {
    key: 'events',
    icon: CalendarDays,
    title: 'Events',
    desc: 'Discover festivals, workshops, sports, and community events',
    href: '/events',
    postHref: '/events/post/new',
    postLabel: 'Post an event',
    categories: EVENT_CATEGORIES,
    categoryParam: 'category',
    basePath: '/events',
  },
  {
    key: 'pros',
    icon: Wrench,
    title: 'Pros',
    desc: 'Find trusted plumbers, tutors, photographers, and more',
    href: '/pros',
    postHref: '/pros/post/new',
    postLabel: 'List your service',
    categories: SERVICE_CATEGORIES,
    categoryParam: 'category',
    basePath: '/pros',
  },
  {
    key: 'places',
    icon: Compass,
    title: 'Places',
    desc: 'Discover temples, trails, lakes, and hidden gems across Nepal',
    href: '/places',
    postHref: '/places/post/new',
    postLabel: 'Add a place',
    categories: PLACE_CATEGORIES,
    categoryParam: 'category',
    basePath: '/places',
  },
  {
    key: 'lost-found',
    icon: HelpCircle,
    title: 'Lost & Found',
    desc: 'Help reunite lost items and pets with their owners',
    href: '/lost-found',
    postHref: '/lost-found/post/new',
    postLabel: 'Post a listing',
    categories: LOST_FOUND_CATEGORIES,
    categoryParam: 'category',
    basePath: '/lost-found',
  },
  {
    key: 'discussions',
    icon: MessageSquare,
    title: 'Discussions',
    desc: 'Ask questions, share tips, and connect with the Nepal community',
    href: '/discussions',
    postHref: '/discussions/post/new',
    postLabel: 'Start a discussion',
    categories: DISCUSSION_CATEGORIES,
    categoryParam: 'category',
    basePath: '/discussions',
  },
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
            <span className="text-cyan-500">One place.</span>
          </h1>
          <p className="animate-fade-up-delay-1 mt-6 text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed">
            Businesses, classifieds, jobs, events, and more &mdash; Nepal&apos;s platform for your neighborhood.
          </p>
        </div>
      </section>

      {/* Quick access grid */}
      <section className="pb-16 sm:pb-20" aria-label="Explore">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Main features">
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FEATURES.map(({ href, icon: Icon, label, desc }, i) => (
                <li key={href} className={STAGGER[i]}>
                  <Link href={href} className="group h-full flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-lg border border-gray-100 hover:border-cyan-200 hover:bg-gray-50 transition-all duration-200">
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 transition-colors mb-2.5" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-950">{label}</span>
                    <span className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Business pitch */}
      <section className="py-16 sm:py-20 bg-gray-950 text-white" aria-labelledby="pitch-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <AnimateIn>
              <h2 id="pitch-heading" className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                Your business deserves more than a Facebook page.
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Get a real web presence in minutes &mdash; your own subdomain, products, menu, gallery, reviews, and contact info.
              </p>
              <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
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

      {/* Directory — pill grid */}
      <section className="py-16 sm:py-20" aria-labelledby="directory-heading">
        <AnimateIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 id="directory-heading" className="text-lg font-semibold text-gray-950">Business directory</h2>
            <Link href="/directory" className="text-sm text-gray-400 hover:text-gray-950 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Directory categories">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/directory/${cat.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-950 hover:bg-gray-50 transition-all duration-150"
              >
                {cat.name}
                <span className="text-xs text-gray-300">{cat.subcategories.length}</span>
              </Link>
            ))}
          </div>
        </AnimateIn>
      </section>

      {/* Classifieds — pill grid */}
      <section className="py-16 sm:py-20 bg-gray-50" aria-labelledby="classifieds-heading">
        <AnimateIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 id="classifieds-heading" className="text-lg font-semibold text-gray-950">Classifieds</h2>
            <Link href="/classifieds" className="text-sm text-gray-400 hover:text-gray-950 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Classified categories">
            {CLASSIFIED_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/classifieds/${cat.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:border-gray-400 hover:text-gray-950 transition-all duration-150"
              >
                {cat.name}
                <span className="text-xs text-gray-300">{cat.subcategories.length}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/classifieds/post/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-full hover:bg-cyan-700 transition-colors">
              Post a free ad <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* Jobs, Events, Lost & Found — card layout */}
      <section className="py-16 sm:py-20" aria-label="More sections">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTIONS.map((section, i) => (
              <AnimateIn key={section.key} delay={i * 0.1}>
                <div className="h-full flex flex-col rounded-lg border border-gray-200 p-5 sm:p-6 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <section.icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-950">{section.title}</h2>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{section.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {section.categories.slice(0, 5).map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`${section.basePath}/category/${cat.slug}`}
                        className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-950 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    {section.categories.length > 5 && (
                      <Link href={section.href} className="px-2.5 py-1 rounded-full text-xs text-gray-400 hover:text-gray-950 transition-colors">
                        +{section.categories.length - 5} more
                      </Link>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-3">
                    <Link href={section.href} className="text-sm text-gray-500 hover:text-gray-950 transition-colors">
                      Browse
                    </Link>
                    <span className="text-gray-200">|</span>
                    <Link href={section.postHref} className="text-sm font-medium text-gray-950 hover:underline flex items-center gap-1">
                      {section.postLabel} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100" role="contentinfo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <Logo className="h-8" />
              <p className="text-sm text-gray-400 mt-1">Everything local. One place.</p>
            </div>
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                <li><Link href="/directory" className="hover:text-gray-950 transition-colors">Directory</Link></li>
                <li><Link href="/classifieds" className="hover:text-gray-950 transition-colors">Classifieds</Link></li>
                <li><Link href="/jobs" className="hover:text-gray-950 transition-colors">Jobs</Link></li>
                <li><Link href="/events" className="hover:text-gray-950 transition-colors">Events</Link></li>
                <li><Link href="/places" className="hover:text-gray-950 transition-colors">Places</Link></li>
                <li><Link href="/pros" className="hover:text-gray-950 transition-colors">Pros</Link></li>
                <li><Link href="/lost-found" className="hover:text-gray-950 transition-colors">Lost &amp; Found</Link></li>
                <li><Link href="/discussions" className="hover:text-gray-950 transition-colors">Discussions</Link></li>
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
