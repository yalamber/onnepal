import { SubdomainChecker } from '@/components/subdomain-checker';
import Link from 'next/link';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, ArrowRight, Palette, Search, Building2, Tag, MapPin, Plus } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Nepal&apos;s Yellow Pages &amp; Classifieds
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            Find businesses.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Buy &amp; sell anything.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Nepal&apos;s one-stop platform to discover local businesses, post classifieds, and create your own business page at <span className="text-gray-700 font-medium">yourname.onnepal.com</span>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/directory" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              <Search className="h-4 w-4" /> Browse Directory
            </Link>
            <Link href="/classifieds" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Tag className="h-4 w-4" /> Buy &amp; Sell
            </Link>
            <Link href="/create-business" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors">
              <Plus className="h-4 w-4" /> List Your Business
            </Link>
          </div>
        </div>
        <div className="absolute top-20 left-8 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-12 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Business Directory Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-3">
                <Building2 className="h-3 w-3" /> Business Directory
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Find businesses by category
              </h2>
              <p className="mt-2 text-gray-500">Browse Nepal&apos;s growing business directory</p>
            </div>
            <Link href="/directory" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/directory/${cat.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-md hover:bg-indigo-50/30 transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/directory" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all categories <ArrowRight className="h-3.5 w-3.5 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Classifieds Section */}
      <section className="py-16 bg-gray-50/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-3">
                <Tag className="h-3 w-3" /> Classifieds
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Buy, sell &amp; find services
              </h2>
              <p className="mt-2 text-gray-500">Post free ads or find what you need across Nepal</p>
            </div>
            <Link href="/classifieds" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CLASSIFIED_CATEGORIES.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/classifieds/${cat.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-md hover:bg-emerald-50/30 transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors truncate">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/classifieds" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Browse all classifieds
            </Link>
            <Link href="/classifieds/post/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus className="h-4 w-4" /> Post Free Ad
            </Link>
          </div>
        </div>
      </section>

      {/* Create Your Page */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Create your free business page
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Get a beautiful mini website at yourname.onnepal.com — set up in under 5 minutes.
            </p>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { step: '1', title: 'Claim your name', description: 'Pick a subdomain like yourshop.onnepal.com. Free and instant.' },
              { step: '2', title: 'Add your details', description: 'Business info, social links, products, and a color theme.' },
              { step: '3', title: 'Share everywhere', description: 'Your page is live. Share on WhatsApp, Facebook, business cards.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Globe, title: 'Your own subdomain', description: 'A memorable link you can share anywhere.', color: 'bg-blue-50 text-blue-600' },
              { icon: LinkIcon, title: 'Social links', description: 'Facebook, Instagram, TikTok, WhatsApp in one place.', color: 'bg-violet-50 text-violet-600' },
              { icon: ShoppingBag, title: 'Products', description: 'Display products with photos and prices.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Megaphone, title: 'Announcements', description: 'Share news and offers with customers.', color: 'bg-amber-50 text-amber-600' },
              { icon: Palette, title: '10 themes', description: 'Color palettes to match your brand.', color: 'bg-pink-50 text-pink-600' },
              { icon: Smartphone, title: 'Mobile-first', description: 'Looks great on every device.', color: 'bg-cyan-50 text-cyan-600' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-9 h-9 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <SubdomainChecker />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <p className="text-sm text-gray-500 mt-1">Free</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">5 min</div>
              <p className="text-sm text-gray-500 mt-1">Setup time</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <p className="text-sm text-gray-500 mt-1">Always online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.2),transparent)]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Nepal&apos;s all-in-one platform
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Directory. Classifieds. Business pages. Everything your business needs to get found online.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/directory" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
              <Search className="h-4 w-4" /> Browse Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-[0.5rem] font-bold">ON</span>
                </div>
                <span className="text-sm font-bold text-gray-300">OnNepal</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Nepal&apos;s Yellow Pages and classifieds platform.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-3">Explore</p>
              <div className="space-y-2">
                <Link href="/directory" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Business Directory</Link>
                <Link href="/classifieds" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Classifieds</Link>
                <Link href="/create-business" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">List Your Business</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-3">Account</p>
              <div className="space-y-2">
                <Link href="/signup" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Sign Up</Link>
                <Link href="/login" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Log In</Link>
                <Link href="/dashboard" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Dashboard</Link>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} OnNepal. Made with love for Nepal.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
