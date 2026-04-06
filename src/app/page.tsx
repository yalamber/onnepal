import { SubdomainChecker } from '@/components/subdomain-checker';
import { Globe, LinkIcon, Megaphone, ShoppingBag, Smartphone, Zap, ArrowRight, Palette, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Free for Nepali businesses
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            Your business deserves
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              its own website
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Create a beautiful mini website in minutes. Share your links,
            products, and announcements — all on <span className="text-gray-700 font-medium">yourname.onnepal.com</span>
          </p>
          <div className="mt-10">
            <SubdomainChecker />
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required. Set up in under 5 minutes.</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-8 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-12 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Preview mockup */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-xl shadow-gray-200/50 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-400 font-mono">
                  yourbusiness.onnepal.com
                </div>
              </div>
            </div>
            {/* Mock page content */}
            <div className="p-6 sm:p-10">
              <div className="max-w-xs mx-auto">
                {/* Mock cover gradient */}
                <div className="h-20 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 mb-6" />
                {/* Mock profile */}
                <div className="flex flex-col items-center -mt-10 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 border-[3px] border-white shadow-md flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                  <div className="mt-3 h-4 w-32 bg-gray-200 rounded-full" />
                  <div className="mt-2 h-3 w-20 bg-gray-100 rounded-full" />
                </div>
                {/* Mock CTA */}
                <div className="h-10 rounded-xl bg-indigo-500 mb-3" />
                {/* Mock links */}
                <div className="space-y-2">
                  <div className="h-11 rounded-xl bg-gray-50 border border-gray-200" />
                  <div className="h-11 rounded-xl bg-gray-50 border border-gray-200" />
                  <div className="h-11 rounded-xl bg-gray-50 border border-gray-200" />
                </div>
                {/* Mock products */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
                    <div className="h-16 bg-gray-100" />
                    <div className="p-2">
                      <div className="h-3 w-16 bg-gray-200 rounded-full" />
                      <div className="h-3 w-10 bg-indigo-100 rounded-full mt-1.5" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
                    <div className="h-16 bg-gray-100" />
                    <div className="p-2">
                      <div className="h-3 w-16 bg-gray-200 rounded-full" />
                      <div className="h-3 w-10 bg-indigo-100 rounded-full mt-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Live in 3 simple steps
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              No technical skills needed. If you can fill a form, you can build your page.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Claim your name',
                description: 'Pick a subdomain like yourshop.onnepal.com. It\'s free and instant.',
              },
              {
                step: '2',
                title: 'Add your details',
                description: 'Fill in your business info, social links, products, and choose a theme.',
              },
              {
                step: '3',
                title: 'Share everywhere',
                description: 'Your page is live. Share it on WhatsApp, Facebook, business cards — anywhere.',
              },
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
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Everything your business needs
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              A complete online presence for your business, no coding or design skills required.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Globe,
                title: 'Your own subdomain',
                description: 'Get yourname.onnepal.com — a memorable link you can share anywhere.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: LinkIcon,
                title: 'Social links',
                description: 'Connect Facebook, Instagram, TikTok, WhatsApp, and more in one place.',
                color: 'bg-violet-50 text-violet-600',
              },
              {
                icon: ShoppingBag,
                title: 'Product showcase',
                description: 'Display products with photos, prices, and descriptions.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: Megaphone,
                title: 'Announcements',
                description: 'Share news, offers, and updates with your customers.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Palette,
                title: 'Theme palettes',
                description: '10 curated color themes to match your brand identity.',
                color: 'bg-pink-50 text-pink-600',
              },
              {
                icon: Smartphone,
                title: 'Mobile-first',
                description: 'Your page looks stunning on every device, automatically.',
                color: 'bg-cyan-50 text-cyan-600',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 bg-gray-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">5 min</div>
              <p className="text-sm text-gray-500 mt-1">Average setup time</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <p className="text-sm text-gray-500 mt-1">Free, no hidden costs</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <p className="text-sm text-gray-500 mt-1">Always online</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.2),transparent)]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to go online?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
            Claim your free subdomain and build your business page today.
          </p>
          <SubdomainChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-[0.5rem] font-bold">ON</span>
              </div>
              <span className="text-sm font-semibold text-gray-400">OnNepal</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} OnNepal. Made with love for Nepal.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
