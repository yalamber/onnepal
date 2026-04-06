import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight">
            Your business.
            <br />
            <span className="text-indigo-600">
              One link.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Create a free mini website for your business in minutes. Share your social links,
            products, announcements, and contact details - all on your own subdomain.
          </p>
          <div className="mt-10">
            <SubdomainChecker />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-12">
            Everything your business needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Your own subdomain',
                description: 'Get yourname.onnepal.com - a memorable link you can share anywhere.',
              },
              {
                icon: LinkIcon,
                title: 'Social links',
                description: 'Connect all your social profiles in one place - Facebook, Instagram, TikTok, WhatsApp, and more.',
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
                className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <feature.icon className="h-10 w-10 text-indigo-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join hundreds of Nepali businesses already using OnNepal to connect with their customers.
          </p>
          <SubdomainChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} OnNepal. Made for Nepal.</p>
      </footer>
    </main>
  );
}
