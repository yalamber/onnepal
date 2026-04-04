import { SubdomainChecker } from '@/components/subdomain-checker';
import { Reveal } from '@/components/scroll-animate';
import { Facebook, Instagram, MessageCircle, Globe, Phone, MapPin, ExternalLink } from 'lucide-react';

/* Compact example — just enough to show the concept */
function MiniExample() {
  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Cover */}
        <div className="h-24">
          <img
            src="https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=640&h=200&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-4 pb-4 -mt-6 relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 border-[3px] border-white flex items-center justify-center text-white font-bold shadow-md text-sm">
            H
          </div>

          <div className="mt-2">
            <p className="font-bold text-slate-900 text-sm">Himalayan Bites</p>
            <p className="text-xs text-slate-400">Restaurant &middot; Thamel</p>
          </div>

          <button className="w-full mt-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold">
            Order on WhatsApp
          </button>

          <div className="mt-3 space-y-1">
            {[
              { icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
              { icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
              { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-600' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <l.icon className={`h-3.5 w-3.5 ${l.color}`} />
                <span className="text-xs font-medium text-slate-600">{l.label}</span>
                <ExternalLink className="h-2.5 w-2.5 text-slate-300 ml-auto" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { name: 'Chicken Momo', price: 'Rs. 350', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=140&fit=crop' },
              { name: 'Thukpa Bowl', price: 'Rs. 280', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=200&h=140&fit=crop' },
            ].map((p) => (
              <div key={p.name} className="rounded-lg overflow-hidden border border-slate-100">
                <img src={p.img} alt={p.name} className="w-full h-16 object-cover" />
                <div className="p-1.5">
                  <p className="text-[0.65rem] text-slate-600">{p.name}</p>
                  <p className="text-[0.65rem] font-bold text-orange-600">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                One page for<br />your business
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed max-w-md">
                Links, products, announcements, contact info — everything your customers need, on your own <span className="font-mono text-sm text-slate-700">.onnepal.com</span> address.
              </p>
              <div className="mt-8">
                <SubdomainChecker />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Free forever. No credit card needed.
              </p>
            </div>

            {/* Example */}
            <div className="hidden lg:block">
              <MiniExample />
            </div>
          </div>

          {/* Mobile example — show below on small screens */}
          <div className="lg:hidden mt-12">
            <MiniExample />
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Everything on one page
            </h2>
            <p className="mt-2 text-slate-500 max-w-lg">
              No app to download. No website to build. Claim your name, add your stuff, share the link.
            </p>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {[
              {
                title: 'Social links',
                desc: 'Facebook, Instagram, WhatsApp, TikTok — all your profiles, one tap away.',
                visual: (
                  <div className="flex gap-1.5">
                    {[
                      { bg: 'bg-blue-600', Icon: Facebook },
                      { bg: 'bg-pink-600', Icon: Instagram },
                      { bg: 'bg-green-600', Icon: MessageCircle },
                      { bg: 'bg-slate-800', Icon: Globe },
                    ].map(({ bg, Icon }, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: 'Products & prices',
                desc: 'Show what you sell. Photos, prices, descriptions. Customers browse before they visit.',
                visual: (
                  <div className="flex gap-1.5">
                    {[
                      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=100&h=100&fit=crop',
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop',
                      'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=100&h=100&fit=crop',
                    ].map((src, i) => (
                      <div key={i} className="w-14 h-14 rounded-lg overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: 'Announcements',
                desc: 'Running a sale? Changed your hours? Post it and customers see it right away.',
                visual: (
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-800 font-medium">20% off this Dashain!</p>
                  </div>
                ),
              },
              {
                title: 'Contact & hours',
                desc: 'Phone, address, business hours — tap to call, tap to navigate.',
                visual: (
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600"><Phone className="h-3 w-3" /> Call</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600"><MapPin className="h-3 w-3" /> Directions</span>
                  </div>
                ),
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div>
                  <div className="mb-3">{item.visual}</div>
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Three steps. Two minutes.
            </h2>
          </Reveal>

          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Pick a name', desc: 'Choose your subdomain — himalayanbites, laxmibeauty, peaktrek.' },
              { n: '02', title: 'Add your info', desc: 'Links, products, contact info. Our wizard walks you through it.' },
              { n: '03', title: 'Share it', desc: 'Your page is live. Put it in your bio, status, business card.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600">{step.n}</span>
                  <h3 className="text-base font-semibold text-slate-900 mt-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Works for any business
            </h2>
            <p className="mt-2 text-slate-500">
              If you have a business in Nepal and customers online — this is for you.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'Restaurants & cafes',
                'Beauty salons',
                'Trek agencies',
                'Retail shops',
                'Freelancers',
                'Hotels & homestays',
              ].map((b) => (
                <div key={b} className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                  <p className="text-sm font-medium text-slate-900">{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900">
        <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24 text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Get your page
            </h2>
            <p className="text-slate-400 mt-3 mb-8">
              Free. Two minutes. No coding.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <SubdomainChecker />
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-slate-500 text-sm font-medium">OnNepal</span>
          <span className="text-slate-600 text-xs">&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
