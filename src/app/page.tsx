import { SubdomainChecker } from '@/components/subdomain-checker';
import { Reveal } from '@/components/scroll-animate';
import { Facebook, Instagram, MessageCircle, Globe, ShoppingBag, Phone, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/* A single, detailed example that looks real */
function LiveExample() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="h-28 relative">
          <img
            src="https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&h=300&fit=crop"
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-5 pb-5 -mt-7 relative">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 border-[3px] border-white flex items-center justify-center text-white text-lg font-bold shadow-md">
            H
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-2">Himalayan Bites</h3>
          <p className="text-xs text-slate-500 mt-0.5">Restaurant & Cafe &middot; Thamel, Kathmandu</p>
          <p className="text-[0.8125rem] text-slate-500 mt-2 leading-relaxed">Authentic Nepali & Tibetan food. Momos, thukpa, dal bhat — made fresh daily.</p>

          {/* CTA */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold">Order on WhatsApp</button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Menu</button>
          </div>

          {/* Links */}
          <div className="mt-4 space-y-1.5">
            {[
              { icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
              { icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
              { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-600' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <l.icon className={`h-4 w-4 ${l.color}`} />
                <span className="text-[0.8125rem] font-medium text-slate-700">{l.label}</span>
                <ExternalLink className="h-3 w-3 text-slate-300 ml-auto" />
              </div>
            ))}
          </div>

          {/* Products */}
          <p className="text-[0.625rem] uppercase tracking-widest text-slate-400 font-semibold mt-5 mb-2">Popular items</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Chicken Momo', price: 'Rs. 350', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=200&fit=crop' },
              { name: 'Thukpa Bowl', price: 'Rs. 280', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=200&h=200&fit=crop' },
            ].map((p) => (
              <div key={p.name} className="rounded-xl overflow-hidden border border-slate-100">
                <img src={p.img} alt={p.name} className="w-full h-20 object-cover" />
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-700">{p.name}</p>
                  <p className="text-xs font-bold text-orange-600">{p.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Announcement */}
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-800 font-medium">20% off all items this Dashain week!</p>
          </div>

          {/* Contact */}
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> 9801234567</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Thamel</span>
          </div>
        </div>
      </div>
      <p className="text-center mt-3 text-xs font-mono text-slate-400">himalayanbites.onnepal.com</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* Hero — split layout, real example on right */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Left — takes 3 cols */}
            <div className="lg:col-span-3 pt-4 sm:pt-8">
              <h1 className="text-[2.25rem] sm:text-[3rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.1]">
                One page for<br />your business
              </h1>
              <p className="mt-5 text-[1.0625rem] text-slate-500 leading-[1.7] max-w-md">
                Links, products, announcements, contact info — everything your customers need, on a single page with your own <span className="font-mono text-slate-700 text-[0.9375rem]">.onnepal.com</span> address.
              </p>
              <div className="mt-8">
                <SubdomainChecker />
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Free forever. No credit card. Takes 2 minutes to set up.
              </p>
            </div>

            {/* Right — live example, takes 2 cols */}
            <div className="lg:col-span-2 hidden lg:block">
              <LiveExample />
            </div>
          </div>
        </div>
      </section>

      {/* What you get — NOT a card grid */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-20 sm:py-28">
          <Reveal>
            <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-slate-900 tracking-[-0.025em] leading-[1.15]">
              Everything on one page
            </h2>
            <p className="mt-3 text-slate-500 text-[1rem] leading-[1.65] max-w-lg">
              No app to download. No website to build. Just claim your name, add your stuff, and share the link.
            </p>
          </Reveal>

          <div className="mt-14 space-y-12">
            {[
              {
                label: 'Social links',
                desc: 'Facebook, Instagram, WhatsApp, TikTok, Viber — all your profiles in one tap.',
                visual: (
                  <div className="flex gap-2">
                    {['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-slate-900'].map((c, i) => (
                      <div key={i} className={`w-9 h-9 rounded-xl ${c} flex items-center justify-center`}>
                        {[Facebook, Instagram, MessageCircle, Globe][i] && (() => {
                          const Icon = [Facebook, Instagram, MessageCircle, Globe][i];
                          return <Icon className="h-4 w-4 text-white" />;
                        })()}
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                label: 'Products & prices',
                desc: 'Show what you sell with photos and prices. Customers browse before they visit.',
                visual: (
                  <div className="flex gap-2">
                    <div className="w-20 h-16 rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=150&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-20 h-16 rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=150&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-20 h-16 rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=200&h=150&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ),
              },
              {
                label: 'Announcements',
                desc: 'Running a sale? Changed your hours? Post it and your customers see it instantly.',
                visual: (
                  <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800 font-medium max-w-xs">
                    20% off this Dashain week!
                  </div>
                ),
              },
              {
                label: 'Contact & hours',
                desc: 'Phone number, address, business hours — tap to call, tap to navigate.',
                visual: (
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"><Phone className="h-3 w-3" /> Call</span>
                    <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"><MapPin className="h-3 w-3" /> Directions</span>
                  </div>
                ),
              },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                  <div className="flex-shrink-0">
                    {item.visual}
                  </div>
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-slate-900">{item.label}</h3>
                    <p className="text-[0.875rem] text-slate-500 mt-1 leading-[1.6]">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — simple, not overdesigned */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
          <Reveal>
            <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-slate-900 tracking-[-0.025em]">
              Three steps. Two minutes.
            </h2>
          </Reveal>

          <div className="mt-10 space-y-8">
            {[
              { n: '1', title: 'Pick a name', desc: 'Choose your subdomain — himalayanbites, laxmibeauty, peaktrek — whatever fits.' },
              { n: '2', title: 'Fill in the details', desc: 'Add your links, products, contact info. Our setup wizard walks you through it.' },
              { n: '3', title: 'Share it', desc: 'Your page is live. Put the link in your Instagram bio, WhatsApp status, business card.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div className="flex gap-5">
                  <span className="text-[2rem] font-bold text-slate-200 leading-none select-none">{step.n}</span>
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-[0.875rem] text-slate-500 mt-1 leading-[1.6]">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for — real examples, not cards */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-20 sm:py-28">
          <Reveal>
            <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-slate-900 tracking-[-0.025em]">
              For every kind of business
            </h2>
            <p className="mt-3 text-slate-500 text-[1rem] leading-[1.65]">
              If you have a business in Nepal and need a place to send people online — this is it.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {[
                { type: 'Restaurants & cafes', example: 'Menu, prices, WhatsApp ordering, Dashain offers' },
                { type: 'Beauty salons', example: 'Services, booking info, before/after photos' },
                { type: 'Trek & travel agencies', example: 'Packages, itineraries, booking links' },
                { type: 'Retail shops', example: 'Product catalog, store hours, location' },
                { type: 'Freelancers & photographers', example: 'Portfolio links, booking, contact' },
                { type: 'Hotels & homestays', example: 'Room info, amenities, booking platforms' },
              ].map((b) => (
                <div key={b.type} className="p-4 rounded-xl bg-white border border-slate-200/60">
                  <p className="text-[0.875rem] font-semibold text-slate-900">{b.type}</p>
                  <p className="text-[0.8125rem] text-slate-400 mt-0.5">{b.example}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA — clean, confident */}
      <section className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
          <Reveal>
            <h2 className="text-[1.5rem] sm:text-[2.25rem] font-bold text-white tracking-[-0.025em] leading-[1.15]">
              Get your page
            </h2>
            <p className="text-slate-400 text-[1rem] mt-3 mb-10 max-w-sm mx-auto leading-[1.6]">
              Free. Takes two minutes. No coding, no credit card.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <SubdomainChecker />
          </Reveal>
        </div>
      </section>

      {/* Footer — minimal */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-slate-500 text-sm font-medium">OnNepal</span>
          <span className="text-slate-600 text-xs">&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
