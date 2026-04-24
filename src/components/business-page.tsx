import {
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Globe, Mail, Phone, MapPin, Clock, MessageCircle, ExternalLink, Pin,
  ArrowUpRight, Star, Tag, ChevronDown,
} from 'lucide-react';

import { ReviewForm } from './review-form';
import { BookingForm } from './booking-form';

function imgSrc(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  return `https://images.onnepal.com/${key}`;
}

function stars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

interface BusinessPageProps {
  business: {
    businessName: string | null;
    businessCategory: string | null;
    description: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    coverPosition: string | null;
    phone: string | null;
    address: string | null;
    businessHours: string | null;
    whatsappNumber: string | null;
    mapAddress: string | null;
    bookingEnabled: boolean;
    primaryColor: string;
    accentColor: string;
    subdomain: string;
    id: string;
    enabledModules: string | null;
  };
  links: Array<{ id: string; platform: string; url: string; label: string | null }>;
  announcements: Array<{ id: string; title: string; content: string | null; isPinned: boolean; createdAt: Date }>;
  products: Array<{ id: string; name: string; description: string | null; price: string | null; imageUrl: string | null }>;
  ctas: Array<{ id: string; label: string; url: string; style: string }>;
  gallery: Array<{ id: string; imageKey: string; caption: string | null }>;
  reviews: Array<{ id: string; reviewerName: string; rating: number; content: string | null; createdAt: Date }>;
  menuItems: Array<{ id: string; name: string; description: string | null; price: string | null; category: string | null; isAvailable: boolean }>;
  offers: Array<{ id: string; title: string; description: string | null; discountText: string | null; code: string | null; expiresAt: Date | null }>;
  teamMembers: Array<{ id: string; name: string; role: string | null; imageKey: string | null }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  averageRating: { average: number; count: number } | null;
}

const PLATFORM_ICONS: Record<string, typeof Globe> = {
  facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin,
  youtube: Youtube, website: Globe, email: Mail, phone: Phone,
  whatsapp: MessageCircle, viber: MessageCircle, tiktok: Globe, custom: ExternalLink,
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X', linkedin: 'LinkedIn',
  youtube: 'YouTube', tiktok: 'TikTok', whatsapp: 'WhatsApp', viber: 'Viber',
  website: 'Website', email: 'Email', phone: 'Phone', custom: 'Link',
};

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export function BusinessPage({ business, links, announcements, products, ctas, gallery, reviews, menuItems, offers, teamMembers, faqs, averageRating }: BusinessPageProps) {
  const primary = business.primaryColor;
  const name = business.businessName || 'Business';
  const hasContact = business.phone || business.address || business.businessHours;
  const modules: string[] = (() => { try { return JSON.parse(business.enabledModules || '["products","links","announcements"]'); } catch { return []; } })();
  const mod = (key: string) => modules.includes(key);
  const hours = business.businessHours ? (() => { try { return JSON.parse(business.businessHours!) as Record<string, string>; } catch { return null; } })() : null;

  const menuByCategory = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Menu';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              {imgSrc(business.logoUrl) ? (
                <img src={imgSrc(business.logoUrl)!} alt={name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primary }}>{name.charAt(0)}</div>
              )}
              <span className="text-sm font-bold text-gray-950">{name}</span>
            </div>
            <div className="flex items-center gap-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-950 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> {business.phone}
                </a>
              )}
              {ctas.length > 0 && (
                <a href={ctas[0].url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-1.5 text-sm font-medium rounded-lg text-white transition-colors"
                  style={{ backgroundColor: primary }}>{ctas[0].label}</a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cover image */}
      <div className="relative">
        {imgSrc(business.coverImageUrl) ? (
          <div className="h-48 sm:h-64 lg:h-72 overflow-hidden">
            <img src={imgSrc(business.coverImageUrl)!} alt="" className="w-full h-full object-cover"
              style={{ objectPosition: `${(business.coverPosition || '50 50').split(' ')[0]}% ${(business.coverPosition || '50 50').split(' ')[1]}%` }} />
          </div>
        ) : (
          <div className="h-36 sm:h-48 lg:h-56"
            style={{ background: `linear-gradient(135deg, ${primary}, ${business.accentColor})` }} />
        )}
      </div>

      {/* Profile section overlapping cover */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16 pb-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
            {/* Logo */}
            <div className="flex-shrink-0">
              {imgSrc(business.logoUrl) ? (
                <img src={imgSrc(business.logoUrl)!} alt={name}
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover border-4 border-white shadow-sm bg-white" />
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl border-4 border-white shadow-sm flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                  style={{ backgroundColor: primary }}>
                  {name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 sm:pb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">{name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {business.businessCategory && <span className="text-sm text-gray-500">{business.businessCategory}</span>}
                {averageRating && averageRating.count > 0 && (
                  <span className="text-sm text-yellow-500">{stars(averageRating.average)} <span className="text-gray-400">({averageRating.count})</span></span>
                )}
              </div>
              {business.description && <p className="mt-1.5 text-gray-500 text-sm leading-relaxed max-w-lg line-clamp-2">{business.description}</p>}
            </div>

            {/* CTA buttons */}
            {ctas.length > 1 && (
              <div className="flex gap-2 flex-shrink-0 sm:pb-1">
                {ctas.slice(1).map((cta) => (
                  <a key={cta.id} href={cta.url} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    {cta.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact bar */}
      {hasContact && (
        <section className="border-b border-gray-100 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {business.phone && <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-950"><Phone className="h-4 w-4 text-gray-400" /> {business.phone}</a>}
              {business.whatsappNumber && <a href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-950"><MessageCircle className="h-4 w-4 text-gray-400" /> WhatsApp</a>}
              {business.address && <span className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4 text-gray-400" /> {business.address}</span>}
              {business.mapAddress && <a href={`https://maps.google.com/?q=${encodeURIComponent(business.mapAddress)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-950">View on map</a>}
            </div>
          </div>
        </section>
      )}

      {/* Special Offers */}
      {mod("offers") && offers.length > 0 && (
        <section className="py-12 bg-amber-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-6">Special Offers</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white border border-amber-200 rounded-lg p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-950">{offer.title}</h3>
                    {offer.discountText && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">{offer.discountText}</span>}
                  </div>
                  {offer.description && <p className="text-sm text-gray-500 mt-2">{offer.description}</p>}
                  {offer.code && <p className="mt-3 text-sm">Code: <span className="font-mono font-semibold text-gray-950 bg-gray-100 px-2 py-0.5 rounded">{offer.code}</span></p>}
                  {offer.expiresAt && <p className="text-xs text-gray-400 mt-2">Expires {new Date(offer.expiresAt).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Business Hours */}
      {mod("hours") && hours && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-6">Business Hours</h2>
            <div className="max-w-sm space-y-1">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                <div key={day} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-600">{DAY_LABELS[day]}</span>
                  <span className={hours[day] === 'closed' ? 'text-red-500' : 'text-gray-950 font-medium'}>
                    {hours[day] || 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu */}
      {mod("menu") && menuItems.length > 0 && (
        <section className="py-12 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Menu</h2>
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{category}</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className={`font-medium text-gray-950 ${!item.isAvailable ? 'line-through text-gray-400' : ''}`}>{item.name}</p>
                        {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                      </div>
                      {item.price && <p className="font-semibold text-gray-950 flex-shrink-0">{item.price}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {mod("products") && products.length > 0 && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Products & Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <div key={product.id}>
                  {imgSrc(product.imageUrl) ? (
                    <img src={imgSrc(product.imageUrl)!} alt={product.name} className="w-full h-48 lg:h-56 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center"><span className="text-3xl font-bold text-gray-200">{product.name.charAt(0)}</span></div>
                  )}
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-950">{product.name}</h3>
                    {product.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>}
                    {product.price && <p className="mt-2 font-semibold" style={{ color: primary }}>{product.price}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {mod("gallery") && gallery.length > 0 && (
        <section className="py-12 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-6">Gallery</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {gallery.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={imgSrc(img.imageKey)!} alt={img.caption || ''} className="w-full h-48 lg:h-56 object-cover rounded-lg" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">{img.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {mod("reviews") && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Reviews</h2>
              {averageRating && averageRating.count > 0 && (
                <span className="text-sm text-gray-500">
                  <span className="text-yellow-500">{stars(averageRating.average)}</span> {averageRating.average.toFixed(1)} ({averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
            {reviews.length > 0 && (
              <div className="space-y-4 mb-8">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-100 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-950">{review.reviewerName}</p>
                      <span className="text-yellow-500 text-sm">{stars(review.rating)}</span>
                    </div>
                    {review.content && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{review.content}</p>}
                    <p className="text-xs text-gray-300 mt-3">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            <ReviewForm businessId={business.id} />
          </div>
        </section>
      )}

      {/* Team */}
      {mod("team") && teamMembers.length > 0 && (
        <section className="py-12 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Our Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center">
                  {imgSrc(member.imageKey) ? (
                    <img src={imgSrc(member.imageKey)!} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-xl font-bold text-gray-300">{member.name.charAt(0)}</div>
                  )}
                  <p className="font-medium text-gray-950 mt-3">{member.name}</p>
                  {member.role && <p className="text-sm text-gray-400">{member.role}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {mod("announcements") && announcements.length > 0 && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">News & Updates</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {announcements.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-5">
                  <div className="flex items-start gap-2">
                    {item.isPinned && <Pin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: primary }} />}
                    <div>
                      <h3 className="font-semibold text-gray-950">{item.title}</h3>
                      {item.content && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.content}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {mod("faq") && faqs.length > 0 && (
        <section className="py-12 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-2xl">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <p className="font-medium text-gray-950">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking */}
      {business.bookingEnabled && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Book an appointment</h2>
                <p className="text-gray-500 mt-2">Fill out the form to request a booking. We&apos;ll confirm your appointment shortly.</p>
                {(business.phone || business.whatsappNumber) && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Phone className="h-4 w-4" /> {business.phone}
                      </a>
                    )}
                    {business.whatsappNumber && (
                      <a href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div>
                <BookingForm businessId={business.id} primaryColor={primary} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social Links */}
      {mod("links") && links.length > 0 && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Connect</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] || Globe;
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-950">{link.label || PLATFORM_LABELS[link.platform] || link.platform}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {imgSrc(business.logoUrl) ? (
                <img src={imgSrc(business.logoUrl)!} alt={name} className="w-7 h-7 rounded-md object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: primary }}>{name.charAt(0)}</div>
              )}
              <span className="text-sm font-semibold text-gray-950">{name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
              {business.phone && <a href={`tel:${business.phone}`} className="hover:text-gray-950 transition-colors">{business.phone}</a>}
              {business.address && <span>{business.address}</span>}
              <a href="https://onnepal.com" className="hover:text-gray-950 transition-colors">Powered by OnNepal</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      {business.whatsappNumber && (
        <a href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-50">
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
