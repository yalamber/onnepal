import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const EXAMPLES = [
  {
    name: 'Himalayan Bites',
    subdomain: 'himalayanbites',
    category: 'Restaurant & Cafe',
    description: 'Authentic Nepali & Tibetan cuisine in the heart of Thamel.',
    color: '#1e40af',
    accent: '#1d4ed8',
    initial: 'H',
    links: ['Facebook', 'Instagram', 'WhatsApp'],
    products: [
      { name: 'Chicken Momo', price: 'Rs. 350' },
      { name: 'Thukpa Bowl', price: 'Rs. 280' },
    ],
    announcement: '20% off on all orders this Dashain!',
  },
  {
    name: 'Laxmi Beauty Studio',
    subdomain: 'laxmibeauty',
    category: 'Beauty & Salon',
    description: 'Premium beauty services. Bridal makeup, hair styling, and skincare.',
    color: '#9333ea',
    accent: '#7c3aed',
    initial: 'L',
    links: ['Instagram', 'Facebook', 'TikTok'],
    products: [
      { name: 'Bridal Package', price: 'Rs. 15,000' },
      { name: 'Hair Treatment', price: 'Rs. 2,500' },
    ],
    announcement: 'Now accepting appointments for wedding season!',
  },
  {
    name: 'Peak Trek Nepal',
    subdomain: 'peaktrek',
    category: 'Hotel & Travel',
    description: 'Adventure awaits. Guided treks to Everest Base Camp and beyond.',
    color: '#059669',
    accent: '#047857',
    initial: 'P',
    links: ['Website', 'Instagram', 'WhatsApp'],
    products: [
      { name: 'EBC Trek', price: 'Rs. 45,000' },
      { name: 'ABC Trek', price: 'Rs. 35,000' },
    ],
    announcement: 'Spring 2026 treks now open for booking!',
  },
];

function ExampleCard({ example }: { example: typeof EXAMPLES[0] }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="h-16" style={{ background: `linear-gradient(135deg, ${example.color}, ${example.accent})` }} />
      <div className="px-5 pb-5 -mt-5 relative">
        <div
          className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm mb-3"
          style={{ background: `linear-gradient(135deg, ${example.color}, ${example.accent})` }}
        >
          {example.initial}
        </div>
        <h3 className="text-[0.875rem] font-bold text-slate-900">{example.name}</h3>
        <p className="text-[0.6875rem] text-slate-400 mt-0.5">{example.category}</p>
        <p className="text-[0.75rem] text-slate-500 mt-2 leading-[1.5] line-clamp-2">{example.description}</p>
        <div className="flex gap-1 mt-3">
          {example.links.map((link) => (
            <span key={link} className="px-2 py-0.5 rounded-full bg-slate-50 text-[0.625rem] text-slate-500 font-medium">{link}</span>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          {example.products.map((p) => (
            <div key={p.name} className="flex justify-between text-[0.75rem]">
              <span className="text-slate-600">{p.name}</span>
              <span className="font-semibold text-slate-900">{p.price}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-[0.6875rem] text-blue-700">{example.announcement}</p>
        </div>
        <p className="mt-3 text-[0.625rem] font-mono text-slate-300">{example.subdomain}.onnepal.com</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Free for all Nepali businesses
            </div>
            <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem] font-bold text-slate-900 tracking-[-0.035em] leading-[1.08]">
              Your business.
              <br />
              <span className="text-blue-600">One link.</span>
            </h1>
          </div>
          <p className="mt-6 text-[1.125rem] sm:text-[1.25rem] text-slate-500 max-w-xl mx-auto animate-fade-in delay-100 leading-[1.65]">
            Create a free mini website for your Nepali business. Social links, products, announcements — all on one beautiful page.
          </p>
          <div className="mt-12 animate-fade-in-up delay-200">
            <SubdomainChecker />
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-24 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.15]">
              See what you can build
            </h2>
            <p className="mt-4 text-slate-500 text-[1.0625rem] leading-[1.65] max-w-lg mx-auto">
              Restaurants, salons, trek agencies — any Nepali business can create a professional page in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXAMPLES.map((ex) => <ExampleCard key={ex.subdomain} example={ex} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.15]">
              Everything you need
            </h2>
            <p className="mt-4 text-slate-500 text-[1.0625rem] leading-[1.65] max-w-md mx-auto">
              A complete business page with all the essentials.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Globe, title: 'Your subdomain', description: 'Get yourname.onnepal.com — a memorable, shareable link.' },
              { icon: LinkIcon, title: 'Social links', description: 'Facebook, Instagram, TikTok, WhatsApp — all in one place.' },
              { icon: ShoppingBag, title: 'Product showcase', description: 'Display products with photos, prices, and descriptions.' },
              { icon: Megaphone, title: 'Announcements', description: 'Share news, offers, and updates instantly.' },
              { icon: Smartphone, title: 'Mobile-first', description: 'Looks perfect on every screen, automatically.' },
              { icon: Zap, title: 'Live in minutes', description: 'Three-step setup. No technical knowledge needed.' },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-[0.9375rem] font-semibold text-slate-900 mb-1.5 tracking-[-0.01em]">{feature.title}</h3>
                <p className="text-slate-500 text-[0.8125rem] leading-[1.65]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-28 bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-[1.75rem] sm:text-[2.75rem] font-bold text-white tracking-[-0.03em] leading-[1.12]">
            Claim your name.<br />Go live today.
          </h2>
          <p className="text-slate-400 text-[1.0625rem] leading-[1.65] mt-6 mb-12 max-w-md mx-auto">
            Join hundreds of Nepali businesses already on OnNepal.
          </p>
          <SubdomainChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800">
        <p className="text-center text-slate-500 text-sm">&copy; {new Date().getFullYear()} OnNepal. Made for Nepal.</p>
      </footer>
    </main>
  );
}
