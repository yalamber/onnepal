import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-950 tracking-tight leading-[1.05]">
              Your business.
              <br />
              One link.
            </h1>
          </div>
          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-xl mx-auto animate-fade-in delay-100 leading-relaxed">
            A free mini website for your Nepali business. Social links, products, announcements — all on one page.
          </p>
          <div className="mt-12 animate-fade-in-up delay-200">
            <SubdomainChecker />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight">
              Everything you need
            </h2>
            <p className="mt-4 text-neutral-500 text-lg max-w-md mx-auto">
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
                <h3 className="text-base font-semibold text-neutral-950 group-hover:text-white mb-1 transition-colors duration-300">{feature.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Claim your name.<br />Go live today.
          </h2>
          <p className="text-neutral-500 text-lg mt-6 mb-12 max-w-md mx-auto">
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
