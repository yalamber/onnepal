import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(91,91,214,0.04),transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center relative">
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-indigo-600 mb-4 tracking-wide uppercase">
              Free for Nepali businesses
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
              Your business.
              <br />
              <span className="text-indigo-600">
                One link.
              </span>
            </h1>
          </div>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto animate-fade-in animation-delay-100 leading-relaxed">
            Create a free mini website for your business in minutes. Share your social links,
            products, announcements, and contact details — all on your own subdomain.
          </p>
          <div className="mt-10 animate-fade-in-up animation-delay-200">
            <SubdomainChecker />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Everything your business needs
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              A complete mini website with all the essential features, ready in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Globe,
                title: 'Your own subdomain',
                description: 'Get yourname.onnepal.com — a memorable link you can share anywhere.',
              },
              {
                icon: LinkIcon,
                title: 'Social links',
                description: 'Connect all your social profiles in one place — Facebook, Instagram, TikTok, WhatsApp, and more.',
              },
              {
                icon: ShoppingBag,
                title: 'Product showcase',
                description: 'Display your products with photos, prices, and descriptions.',
              },
              {
                icon: Megaphone,
                title: 'Announcements',
                description: 'Share news, offers, and updates with your customers.',
              },
              {
                icon: Smartphone,
                title: 'Mobile-first design',
                description: 'Your page looks great on every device, automatically.',
              },
              {
                icon: Zap,
                title: 'Ready in minutes',
                description: 'Simple setup wizard gets your page live in under 5 minutes.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-lg border border-gray-200/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors duration-200">
                  <feature.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
            Join hundreds of Nepali businesses already using OnNepal to connect with their customers.
          </p>
          <SubdomainChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 border-t border-gray-800 text-gray-500 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} OnNepal. Made for Nepal.</p>
      </footer>
    </main>
  );
}
