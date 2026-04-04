import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap, ArrowRight, Palette, BarChart3, Check } from 'lucide-react';

const EXAMPLES = [
  {
    name: 'Himalayan Bites',
    subdomain: 'himalayanbites',
    category: 'Restaurant & Cafe',
    color: '#1e40af',
    accent: '#3b82f6',
    initial: 'H',
    coverImage: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&h=300&fit=crop',
    links: ['Facebook', 'Instagram', 'WhatsApp'],
    products: [
      { name: 'Chicken Momo', price: 'Rs. 350', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=200&fit=crop' },
      { name: 'Thukpa Bowl', price: 'Rs. 280', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=200&h=200&fit=crop' },
    ],
    announcement: '20% off this Dashain!',
  },
  {
    name: 'Laxmi Beauty Studio',
    subdomain: 'laxmibeauty',
    category: 'Beauty & Salon',
    color: '#9333ea',
    accent: '#a855f7',
    initial: 'L',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=300&fit=crop',
    links: ['Instagram', 'Facebook', 'TikTok'],
    products: [
      { name: 'Bridal Package', price: 'Rs. 15,000', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop' },
      { name: 'Hair Treatment', price: 'Rs. 2,500', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop' },
    ],
    announcement: 'Booking for wedding season!',
  },
  {
    name: 'Peak Trek Nepal',
    subdomain: 'peaktrek',
    category: 'Hotel & Travel',
    color: '#059669',
    accent: '#34d399',
    initial: 'P',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=300&fit=crop',
    links: ['Website', 'Instagram', 'WhatsApp'],
    products: [
      { name: 'EBC Trek', price: 'Rs. 45,000', img: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=200&h=200&fit=crop' },
      { name: 'ABC Trek', price: 'Rs. 35,000', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop' },
    ],
    announcement: 'Spring 2026 now open!',
  },
];

/* Phone mockup showing a mini business page */
function PhoneMockup({ example }: { example: typeof EXAMPLES[0] }) {
  return (
    <div className="relative mx-auto" style={{ width: 260 }}>
      {/* Phone frame */}
      <div className="rounded-[2rem] border-[6px] border-slate-900 bg-white shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="bg-slate-900 h-6 flex items-center justify-center">
          <div className="w-16 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Page content */}
        <div className="h-[420px] overflow-hidden">
          {/* Cover */}
          <div className="h-20 relative">
            <img src={example.coverImage} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="px-4 -mt-5 relative">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: `linear-gradient(135deg, ${example.color}, ${example.accent})` }}
            >
              {example.initial}
            </div>

            <h3 className="text-[0.75rem] font-bold text-slate-900 mt-2">{example.name}</h3>
            <p className="text-[0.5625rem] text-slate-400">{example.category}</p>

            {/* CTA */}
            <button
              className="w-full mt-3 py-1.5 rounded-lg text-white text-[0.625rem] font-semibold"
              style={{ backgroundColor: example.color }}
            >
              Order Now
            </button>

            {/* Links */}
            <div className="mt-3 space-y-1">
              {example.links.map((link) => (
                <div key={link} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
                  <div className="w-4 h-4 rounded bg-slate-200" />
                  <span className="text-[0.5625rem] text-slate-600 font-medium">{link}</span>
                </div>
              ))}
            </div>

            {/* Products */}
            <p className="text-[0.5rem] uppercase tracking-wider text-slate-400 font-semibold mt-3 mb-1.5">Products</p>
            <div className="grid grid-cols-2 gap-1.5">
              {example.products.map((p) => (
                <div key={p.name} className="rounded-lg overflow-hidden bg-slate-50">
                  <img src={p.img} alt={p.name} className="w-full h-12 object-cover" />
                  <div className="px-1.5 py-1">
                    <p className="text-[0.5rem] text-slate-600 truncate">{p.name}</p>
                    <p className="text-[0.5rem] font-bold" style={{ color: example.color }}>{p.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Announcement */}
            <div className="mt-2 p-1.5 rounded-lg" style={{ backgroundColor: `${example.color}10` }}>
              <p className="text-[0.5rem] font-medium" style={{ color: example.color }}>{example.announcement}</p>
            </div>
          </div>
        </div>
      </div>

      {/* URL label */}
      <div className="text-center mt-3">
        <p className="text-[0.75rem] font-mono text-slate-400">{example.subdomain}.onnepal.com</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Free for all Nepali businesses
              </div>
              <h1 className="text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold text-slate-900 tracking-[-0.035em] leading-[1.08]">
                Your business.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">One link.</span>
              </h1>
              <p className="mt-5 text-[1.0625rem] sm:text-[1.125rem] text-slate-500 max-w-md mx-auto lg:mx-0 leading-[1.65]">
                Create a beautiful mini website for your business in minutes. Social links, products, announcements — all on one page.
              </p>
              <div className="mt-8 max-w-md mx-auto lg:mx-0">
                <SubdomainChecker />
              </div>
            </div>

            {/* Right: Phone mockups */}
            <div className="hidden lg:flex items-center justify-center animate-fade-in-up delay-200">
              <div className="relative">
                <div className="absolute -left-8 top-8 opacity-60 scale-90 -rotate-6">
                  <PhoneMockup example={EXAMPLES[2]} />
                </div>
                <div className="relative z-10">
                  <PhoneMockup example={EXAMPLES[0]} />
                </div>
                <div className="absolute -right-8 top-8 opacity-60 scale-90 rotate-6">
                  <PhoneMockup example={EXAMPLES[1]} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-center text-[1.5rem] sm:text-[1.75rem] font-bold text-slate-900 tracking-[-0.025em] mb-12">
            Live in 3 simple steps
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Claim your name', desc: 'Pick your unique subdomain. It\'s free and takes 10 seconds.', color: 'from-blue-500 to-blue-600' },
              { step: '2', title: 'Add your content', desc: 'Links, products, announcements, contact info — fill in what matters.', color: 'from-violet-500 to-violet-600' },
              { step: '3', title: 'Go live', desc: 'Hit publish. Your page is live and ready to share.', color: 'from-emerald-500 to-emerald-600' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-lg font-bold mx-auto mb-4 shadow-lg`}>
                  {s.step}
                </div>
                <h3 className="text-[0.9375rem] font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-[0.8125rem] text-slate-500 leading-[1.6]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples - Mobile phone previews */}
      <section className="py-24 sm:py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.15]">
              See what you can build
            </h2>
            <p className="mt-4 text-slate-500 text-[1.0625rem] leading-[1.65] max-w-lg mx-auto">
              Restaurants, salons, trek agencies — any Nepali business gets a professional page.
            </p>
          </div>
          <div className="flex justify-center gap-8 overflow-x-auto pb-4">
            {EXAMPLES.map((ex) => (
              <PhoneMockup key={ex.subdomain} example={ex} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.15]">
              Everything you need
            </h2>
            <p className="mt-4 text-slate-500 text-[1.0625rem] leading-[1.65] max-w-md mx-auto">
              All the tools to build a complete business page.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Globe, title: 'Your subdomain', description: 'yourname.onnepal.com — a memorable, shareable link.', color: 'bg-blue-50 text-blue-600' },
              { icon: LinkIcon, title: 'Social links', description: 'Facebook, Instagram, TikTok, WhatsApp — all in one place.', color: 'bg-violet-50 text-violet-600' },
              { icon: ShoppingBag, title: 'Product showcase', description: 'Photos, prices, and descriptions for every item.', color: 'bg-amber-50 text-amber-600' },
              { icon: Megaphone, title: 'Announcements', description: 'Share news, offers, and updates instantly.', color: 'bg-rose-50 text-rose-600' },
              { icon: Palette, title: '10 color themes', description: 'Choose a palette that matches your brand.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Smartphone, title: 'Mobile-first', description: 'Looks perfect on every screen, automatically.', color: 'bg-sky-50 text-sky-600' },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[0.9375rem] font-semibold text-slate-900 mb-1.5 tracking-[-0.01em]">{feature.title}</h3>
                <p className="text-slate-500 text-[0.8125rem] leading-[1.65]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Businesses registered' },
              { value: '50K+', label: 'Monthly page views' },
              { value: '2 min', label: 'Average setup time' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[2rem] font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-[0.8125rem] text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why OnNepal */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-center text-[1.75rem] sm:text-[2rem] font-bold text-slate-900 tracking-[-0.025em] mb-12">
            Built for Nepali businesses
          </h2>
          <div className="space-y-4">
            {[
              { title: 'No coding required', desc: 'If you can fill a form, you can build your page. Our wizard guides you step by step.' },
              { title: 'Free forever', desc: 'No hidden fees, no trials. Your OnNepal page is free to create and host.' },
              { title: 'Share everywhere', desc: 'One link for Facebook, Instagram, WhatsApp, business cards, and anywhere else.' },
              { title: 'Update anytime', desc: 'New products? Special offer? Update your page in seconds from your dashboard.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-[0.8125rem] text-slate-500 mt-1 leading-[1.6]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-[1.75rem] sm:text-[2.5rem] font-bold text-white tracking-[-0.03em] leading-[1.12]">
            Your business deserves<br />its own page.
          </h2>
          <p className="text-blue-200/60 text-[1.0625rem] leading-[1.65] mt-6 mb-12 max-w-md mx-auto">
            Join hundreds of Nepali businesses already on OnNepal. It&apos;s free.
          </p>
          <SubdomainChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[0.5rem] font-bold">ON</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">OnNepal</span>
          </div>
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} OnNepal. Made for Nepal.</p>
        </div>
      </footer>
    </main>
  );
}
