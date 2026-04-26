import {
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Globe, Mail, Phone, MapPin, Clock, MessageCircle, ExternalLink, Pin,
  ArrowUpRight, Star, Tag, ChevronDown,
} from 'lucide-react';

import { ReviewForm } from './review-form';
import { BookingForm } from './booking-form';
import { SectionTabs } from './section-tabs';

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
    isVerified: boolean;
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

  const tabs = [
    mod("offers") && offers.length > 0 && { id: 'offers', label: 'Offers' },
    mod("hours") && hours && { id: 'hours', label: 'Hours' },
    mod("menu") && menuItems.length > 0 && { id: 'menu', label: 'Menu' },
    mod("products") && products.length > 0 && { id: 'products', label: 'Products' },
    mod("gallery") && gallery.length > 0 && { id: 'gallery', label: 'Gallery' },
    mod("announcements") && announcements.length > 0 && { id: 'announcements', label: 'Updates' },
    mod("team") && teamMembers.length > 0 && { id: 'team', label: 'Team' },
    mod("reviews") && { id: 'reviews', label: 'Reviews' },
    mod("faq") && faqs.length > 0 && { id: 'faq', label: 'FAQ' },
    business.bookingEnabled && { id: 'booking', label: 'Book' },
    mod("links") && links.length > 0 && { id: 'links', label: 'Links' },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header card: cover + profile + tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          {/* Cover image */}
          {imgSrc(business.coverImageUrl) ? (
            <div className="h-40 sm:h-52 lg:h-60 overflow-hidden">
              <img src={imgSrc(business.coverImageUrl)!} alt="" className="w-full h-full object-cover"
                style={{ objectPosition: `${(business.coverPosition || '50 50').split(' ')[0]}% ${(business.coverPosition || '50 50').split(' ')[1]}%` }}
                loading="eager" fetchPriority="high" decoding="async"
                width="1280" height="480" />
            </div>
          ) : (
            <div className="h-28 sm:h-36"
              style={{ background: `linear-gradient(135deg, ${primary}, ${business.accentColor})` }} />
          )}

          {/* Profile row */}
          <div className="px-5 sm:px-6 pb-5">
            {/* Logo — only this overlaps cover */}
            <div className="-mt-8 sm:-mt-10 mb-3">
              {imgSrc(business.logoUrl) ? (
                <img src={imgSrc(business.logoUrl)!} alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border-[2px] border-white shadow-sm bg-white"
                  loading="eager" fetchPriority="high" decoding="async"
                  width="96" height="96" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-[2px] border-white shadow-sm flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                  style={{ backgroundColor: primary }}>
                  {name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name + meta on left, contact on right — fully below cover */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-950 leading-tight flex items-center gap-1.5">
                  {name}
                  {business.isVerified && (
                    <svg className="h-5 w-5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  {business.businessCategory && <span className="text-sm text-gray-400">{business.businessCategory}</span>}
                  {averageRating && averageRating.count > 0 && (
                    <span className="text-sm text-yellow-500">{stars(averageRating.average)} <span className="text-gray-400 text-xs">({averageRating.count})</span></span>
                  )}
                </div>
                {business.description && <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-2">{business.description}</p>}
              </div>

              {/* Contact + CTA on right */}
              <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-2">
                {hasContact && (
                  <div className="flex flex-wrap sm:justify-end gap-x-4 gap-y-1">
                    {business.phone && <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-950 transition-colors"><Phone className="h-3 w-3 text-gray-400" /> {business.phone}</a>}
                    {business.address && <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="h-3 w-3 text-gray-400" /> {business.address}</span>}
                    {business.whatsappNumber && <a href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-950 transition-colors"><MessageCircle className="h-3 w-3 text-gray-400" /> WhatsApp</a>}
                  </div>
                )}
                {ctas.length > 0 && (
                  <div className="flex gap-2">
                    {ctas.map((cta, i) => (
                      <a key={cta.id} href={cta.url} target="_blank" rel="noopener noreferrer"
                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          i === 0 ? 'text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        style={i === 0 ? { backgroundColor: primary } : undefined}>
                        {cta.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky section tabs with scroll-spy */}
      {tabs.length > 0 && <SectionTabs tabs={tabs} accentColor={primary} />}

      {/* Content sections — each in a white card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 space-y-4">

        {/* Special Offers */}
        {mod("offers") && offers.length > 0 && (
          <div id="offers" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Special Offers</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {offers.map((offer) => (
                <div key={offer.id} className="border border-amber-200 bg-amber-50/30 rounded-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm text-gray-950">{offer.title}</h3>
                    {offer.discountText && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-semibold rounded">{offer.discountText}</span>}
                  </div>
                  {offer.description && <p className="text-sm text-gray-500 mt-1.5">{offer.description}</p>}
                  {offer.code && <p className="mt-2 text-sm">Code: <span className="font-mono font-semibold text-gray-950 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{offer.code}</span></p>}
                  {offer.expiresAt && <p className="text-xs text-gray-400 mt-2">Expires {new Date(offer.expiresAt).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Hours */}
        {mod("hours") && hours && (
          <div id="hours" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Business Hours</h2>
            <div className="max-w-xs space-y-0.5">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                <div key={day} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-500">{DAY_LABELS[day]}</span>
                  <span className={hours[day] === 'closed' ? 'text-red-500 text-xs' : 'text-gray-950 font-medium'}>
                    {hours[day] || 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        {mod("menu") && menuItems.length > 0 && (
          <div id="menu" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-5">Menu</h2>
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{category}</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-950 ${!item.isAvailable ? 'line-through text-gray-400' : ''}`}>{item.name}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>}
                      </div>
                      {item.price && (
                        <>
                          <div className="flex-1 border-b border-dotted border-gray-200 mt-2.5" aria-hidden="true" />
                          <p className="text-sm font-semibold text-gray-950 flex-shrink-0">{item.price}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {mod("products") && products.length > 0 && (
          <div id="products" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-5">Products & Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="group">
                  <div className="aspect-[4/3] bg-gray-50 rounded-md overflow-hidden">
                    {imgSrc(product.imageUrl) ? (
                      <img src={imgSrc(product.imageUrl)!} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy" decoding="async" width="400" height="300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="text-2xl font-bold text-gray-200">{product.name.charAt(0)}</span></div>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-sm font-semibold text-gray-950 group-hover:text-gray-700 transition-colors">{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{product.description}</p>}
                    {product.price && <p className="mt-1.5 text-sm font-semibold" style={{ color: primary }}>{product.price}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {mod("gallery") && gallery.length > 0 && (
          <div id="gallery" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Gallery</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {gallery.map((img) => (
                <div key={img.id} className="relative group aspect-square overflow-hidden rounded-md bg-gray-50">
                  <img src={imgSrc(img.imageKey)!} alt={img.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy" decoding="async" width="400" height="400" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity">{img.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements */}
        {mod("announcements") && announcements.length > 0 && (
          <div id="announcements" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-4">News & Updates</h2>
            <div className="space-y-2.5">
              {[...announcements].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)).map((item) => (
                <div key={item.id} className={`p-4 rounded-md border ${item.isPinned ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-start gap-2">
                    {item.isPinned && <Pin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-sm font-semibold text-gray-950">{item.title}</h3>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {item.content && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.content}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {mod("team") && teamMembers.length > 0 && (
          <div id="team" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-5">Our Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center">
                  {imgSrc(member.imageKey) ? (
                    <img src={imgSrc(member.imageKey)!} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto"
                      loading="lazy" decoding="async" width="80" height="80" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-lg font-bold text-gray-300">{member.name.charAt(0)}</div>
                  )}
                  <p className="text-sm font-medium text-gray-950 mt-2">{member.name}</p>
                  {member.role && <p className="text-xs text-gray-400">{member.role}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {mod("reviews") && (
          <div id="reviews" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="text-lg font-bold text-gray-950">Reviews</h2>
              {averageRating && averageRating.count > 0 && (
                <span className="text-sm text-gray-500">
                  <span className="text-yellow-500">{stars(averageRating.average)}</span> {averageRating.average.toFixed(1)} ({averageRating.count})
                </span>
              )}
            </div>
            {reviews.length > 0 && (
              <div className="space-y-3 mb-6">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 p-4 bg-gray-50 rounded-md">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: primary }}>
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-950">{review.reviewerName}</p>
                        <span className="text-yellow-500 text-xs">{stars(review.rating)}</span>
                        <span className="text-[11px] text-gray-400 ml-auto">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {review.content && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.content}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <ReviewForm businessId={business.id} />
          </div>
        )}

        {/* FAQ */}
        {mod("faq") && faqs.length > 0 && (
          <div id="faq" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <p className="text-sm font-medium text-gray-950">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking */}
        {business.bookingEnabled && (
          <div id="booking" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Book an appointment</h2>
                <p className="text-sm text-gray-500 mt-1">Fill out the form to request a booking.</p>
                {(business.phone || business.whatsappNumber) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                    )}
                    {business.whatsappNumber && (
                      <a href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
              <BookingForm businessId={business.id} primaryColor={primary} />
            </div>
          </div>
        )}

        {/* Social Links */}
        {mod("links") && links.length > 0 && (
          <div id="links" className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Connect</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {links.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] || Globe;
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-950">{link.label || PLATFORM_LABELS[link.platform] || link.platform}</span>
                    <ArrowUpRight className="h-3 w-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {imgSrc(business.logoUrl) ? (
                <img src={imgSrc(business.logoUrl)!} alt={name} className="w-6 h-6 rounded-md object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: primary }}>{name.charAt(0)}</div>
              )}
              <span className="text-sm font-medium text-gray-500">{name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-400">
              {business.phone && <a href={`tel:${business.phone}`} className="hover:text-gray-950 transition-colors">{business.phone}</a>}
              {business.address && <span>{business.address}</span>}
              <a href="https://onnepal.com" className="hover:text-gray-600 transition-colors">Powered by OnNepal</a>
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
