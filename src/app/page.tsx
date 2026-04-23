import Link from 'next/link';
import { SubdomainChecker } from '@/components/subdomain-checker';
import { CATEGORIES } from '@/lib/categories';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl font-bold text-gray-950 tracking-tight leading-[1.05]">
            Nepal&apos;s business
            <br />
            directory &amp; classifieds
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-gray-400 max-w-xl leading-relaxed font-light">
            Discover local businesses. Buy and sell anything. Get your own page at yourname.onnepal.com.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/directory" className="px-5 py-2.5 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Browse directory
            </Link>
            <Link href="/classifieds" className="px-5 py-2.5 text-gray-950 text-sm font-medium rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              Classifieds
            </Link>
            <Link href="/create-business" className="px-5 py-2.5 text-gray-500 text-sm font-medium rounded-lg hover:text-gray-950 transition-colors">
              List your business &rarr;
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-gray-100" /></div>

      {/* Directory categories */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-950">Business directory</h2>
            <Link href="/directory" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/directory/${cat.slug}`} className="group py-0.5">
                <span className="text-[0.9375rem] text-gray-600 group-hover:text-gray-950 transition-colors">{cat.name}</span>
                <span className="text-xs text-gray-300 ml-1">{cat.subcategories.length}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Classifieds categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-950">Classifieds</h2>
            <Link href="/classifieds" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
            {CLASSIFIED_CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/classifieds/${cat.slug}`} className="group py-0.5">
                <span className="text-[0.9375rem] text-gray-600 group-hover:text-gray-950 transition-colors">{cat.name}</span>
                <span className="text-xs text-gray-300 ml-1">{cat.subcategories.length}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/classifieds/post/new" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              Post a free ad &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Business pages pitch */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider font-medium">For business owners</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight leading-tight">
            Your business deserves<br />more than a Facebook page.
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
            Get a real web presence in minutes. Your own subdomain, social links, products, announcements, and contact info — all in one place.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold text-gray-950 mb-1">Your own URL</p>
              <p className="text-sm text-gray-400 leading-relaxed">yourshop.onnepal.com — share it on WhatsApp, print it on cards.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950 mb-1">All your links</p>
              <p className="text-sm text-gray-400 leading-relaxed">Facebook, Instagram, TikTok, WhatsApp — one page for everything.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950 mb-1">Products &amp; prices</p>
              <p className="text-sm text-gray-400 leading-relaxed">Show what you sell with photos, descriptions, and pricing.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950 mb-1">Up to 5 businesses</p>
              <p className="text-sm text-gray-400 leading-relaxed">One account, multiple businesses. Each gets its own page.</p>
            </div>
          </div>
          <div className="mt-12">
            <SubdomainChecker />
          </div>
          <p className="mt-3 text-xs text-gray-300">Free. No credit card. Takes 5 minutes.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-950">OnNepal</p>
              <p className="text-sm text-gray-400 mt-1">Nepal&apos;s Yellow Pages &amp; classifieds.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
              <Link href="/directory" className="hover:text-gray-950 transition-colors">Directory</Link>
              <Link href="/classifieds" className="hover:text-gray-950 transition-colors">Classifieds</Link>
              <Link href="/signup" className="hover:text-gray-950 transition-colors">Sign up</Link>
              <Link href="/login" className="hover:text-gray-950 transition-colors">Log in</Link>
            </div>
          </div>
          <p className="mt-8 text-xs text-gray-300">&copy; {new Date().getFullYear()} OnNepal</p>
        </div>
      </footer>
    </main>
  );
}
