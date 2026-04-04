import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap, ExternalLink, Phone, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';

const EXAMPLES = [
  {
    name: 'Himalayan Bites',
    subdomain: 'himalayanbites',
    category: 'Restaurant & Cafe',
    description: 'Authentic Nepali & Tibetan cuisine in the heart of Thamel. Momos, thukpa, and more.',
    color: '#1a1a2e',
    accent: '#16213e',
    initial: 'H',
    links: ['Facebook', 'Instagram', 'WhatsApp'],
    products: [
      { name: 'Chicken Momo', price: 'Rs. 350' },
      { name: 'Thukpa Bowl', price: 'Rs. 280' },
      { name: 'Buff Chhoila', price: 'Rs. 400' },
    ],
    announcement: '🎉 20% off on all orders this Dashain!',
    phone: '+977 9801234567',
    address: 'Thamel, Kathmandu',
  },
  {
    name: 'Laxmi Beauty Studio',
    subdomain: 'laxmibeauty',
    category: 'Beauty & Salon',
    description: 'Premium beauty services for every occasion. Bridal makeup, hair styling, and skincare.',
    color: '#6b21a8',
    accent: '#9333ea',
    initial: 'L',
    links: ['Instagram', 'Facebook', 'TikTok'],
    products: [
      { name: 'Bridal Package', price: 'Rs. 15,000' },
      { name: 'Hair Treatment', price: 'Rs. 2,500' },
      { name: 'Facial', price: 'Rs. 1,800' },
    ],
    announcement: 'Now accepting appointments for wedding season!',
    phone: '+977 9812345678',
    address: 'New Road, Kathmandu',
  },
  {
    name: 'Peak Trek Nepal',
    subdomain: 'peaktrek',
    category: 'Hotel & Travel',
    description: 'Adventure awaits. Guided treks to Everest Base Camp, Annapurna Circuit, and beyond.',
    color: '#0f766e',
    accent: '#14b8a6',
    initial: 'P',
    links: ['Website', 'Instagram', 'WhatsApp'],
    products: [
      { name: 'EBC Trek', price: 'Rs. 45,000' },
      { name: 'ABC Trek', price: 'Rs. 35,000' },
      { name: 'Langtang Valley', price: 'Rs. 28,000' },
    ],
    announcement: 'Spring 2026 treks now open for booking!',
    phone: '+977 9823456789',
    address: 'Lazimpat, Kathmandu',
  },
];

function ExampleCard({ example }: { example: typeof EXAMPLES[0] }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-neutral-200 transition-all duration-300">
      {/* Mini cover */}
      <div
        className="h-20 relative"
        style={{ background: `linear-gradient(135deg, ${example.color}, ${example.accent})` }}
      />

      <div className="px-5 pb-6 -mt-6 relative">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold mb-3"
          style={{ background: `linear-gradient(135deg, ${example.color}, ${example.accent})` }}
        >
          {example.initial}
        </div>

        {/* Info */}
        <h3 className="text-[0.9375rem] font-bold text-neutral-950 tracking-[-0.01em]">{example.name}</h3>
        <p className="text-[0.75rem] text-neutral-400 mt-0.5">{example.category}</p>
        <p className="text-[0.8125rem] text-neutral-500 mt-2 leading-[1.6] line-clamp-2">{example.description}</p>

        {/* Mini links */}
        <div className="flex gap-1.5 mt-4">
          {example.links.map((link) => (
            <span key={link} className="px-2.5 py-1 rounded-full bg-neutral-50 text-[0.6875rem] text-neutral-500 font-medium">
              {link}
            </span>
          ))}
        </div>

        {/* Mini products */}
        <div className="mt-4 space-y-1.5">
          {example.products.map((product) => (
            <div key={product.name} className="flex justify-between items-center">
              <span className="text-[0.8125rem] text-neutral-700">{product.name}</span>
              <span className="text-[0.75rem] font-semibold text-neutral-950">{product.price}</span>
            </div>
          ))}
        </div>

        {/* Announcement */}
        <div className="mt-4 p-3 rounded-xl bg-neutral-50">
          <p className="text-[0.75rem] text-neutral-600 leading-[1.5]">{example.announcement}</p>
        </div>

        {/* Contact */}
        <div className="mt-4 flex items-center gap-4 text-[0.75rem] text-neutral-400">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {example.phone}
          </span>
        </div>

        {/* URL */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <p className="text-[0.75rem] font-mono text-neutral-400">
            {example.subdomain}.onnepal.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <div className="animate-fade-in">
            <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem] font-bold text-neutral-950 tracking-[-0.035em] leading-[1.08]">
              Your business.
              <br />
              One link.
            </h1>
          </div>
          <p className="mt-6 text-[1.125rem] sm:text-[1.25rem] text-neutral-500 max-w-xl mx-auto animate-fade-in delay-100 leading-[1.65] tracking-[-0.011em]">
            A free mini website for your Nepali business. Social links, products, announcements — all on one page.
          </p>
          <div className="mt-12 animate-fade-in-up delay-200">
            <SubdomainChecker />
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-neutral-950 tracking-[-0.03em] leading-[1.15]">
              See what you can build
            </h2>
            <p className="mt-4 text-neutral-500 text-[1.0625rem] leading-[1.65] max-w-lg mx-auto">
              Restaurants, salons, trek agencies — any Nepali business can create a professional page in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXAMPLES.map((example) => (
              <ExampleCard key={example.subdomain} example={example} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-neutral-950 tracking-[-0.03em] leading-[1.15]">
              Everything you need
            </h2>
            <p className="mt-4 text-neutral-500 text-[1.0625rem] leading-[1.65] max-w-md mx-auto">
              A complete business page with all the essentials.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Globe,
                title: 'Your subdomain',
                description: 'Get yourname.onnepal.com — a memorable, shareable link.',
              },
              {
                icon: LinkIcon,
                title: 'Social links',
                description: 'Facebook, Instagram, TikTok, WhatsApp — all in one place.',
              },
              {
                icon: ShoppingBag,
                title: 'Product showcase',
                description: 'Display products with photos, prices, and descriptions.',
              },
              {
                icon: Megaphone,
                title: 'Announcements',
                description: 'Share news, offers, and updates instantly.',
              },
              {
                icon: Smartphone,
                title: 'Mobile-first',
                description: 'Looks perfect on every screen, automatically.',
              },
              {
                icon: Zap,
                title: 'Live in minutes',
                description: 'Three-step setup. No technical knowledge needed.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white hover:bg-neutral-950 transition-all duration-300"
              >
                <feature.icon className="h-6 w-6 text-neutral-400 group-hover:text-white mb-4 transition-colors duration-300" />
                <h3 className="text-[0.9375rem] font-semibold text-neutral-950 group-hover:text-white mb-1.5 tracking-[-0.01em] transition-colors duration-300">{feature.title}</h3>
                <p className="text-neutral-500 text-[0.8125rem] leading-[1.65] group-hover:text-neutral-400 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-[1.75rem] sm:text-[2.75rem] font-bold text-white tracking-[-0.03em] leading-[1.12]">
            Claim your name.<br />Go live today.
          </h2>
          <p className="text-neutral-500 text-[1.0625rem] leading-[1.65] mt-6 mb-12 max-w-md mx-auto">
            Join hundreds of Nepali businesses already on OnNepal.
          </p>
          <SubdomainChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-neutral-950 border-t border-neutral-900">
        <p className="text-center text-neutral-600 text-sm">&copy; {new Date().getFullYear()} OnNepal</p>
      </footer>
    </main>
  );
}
