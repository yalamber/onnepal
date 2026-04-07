import {
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Globe, Mail, Phone, MapPin, Clock, MessageCircle, ExternalLink, Pin
} from 'lucide-react';

interface BusinessPageProps {
  business: {
    businessName: string | null;
    businessCategory: string | null;
    description: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    phone: string | null;
    address: string | null;
    businessHours: string | null;
    primaryColor: string;
    accentColor: string;
  };
  links: Array<{ id: string; platform: string; url: string; label: string | null; }>;
  announcements: Array<{ id: string; title: string; content: string | null; isPinned: boolean; createdAt: Date; }>;
  products: Array<{ id: string; name: string; description: string | null; price: string | null; imageUrl: string | null; }>;
  ctas: Array<{ id: string; label: string; url: string; style: string; }>;
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

export function BusinessPage({ business, links, announcements, products, ctas }: BusinessPageProps) {
  const primary = business.primaryColor;
  const accent = business.accentColor;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover */}
      <div
        className="relative h-48 sm:h-56"
        style={{
          background: business.coverImageUrl
            ? `url(${business.coverImageUrl}) center/cover`
            : `linear-gradient(135deg, ${primary} 0%, ${accent} 50%, ${primary}dd 100%)`,
        }}
      >
        {/* Subtle pattern overlay */}
        {!business.coverImageUrl && (
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-14 relative z-10 pb-20">
        {/* Profile */}
        <div className="text-center mb-8">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.businessName || ''}
              className="w-24 h-24 rounded-2xl border-4 border-white mx-auto object-cover bg-white shadow-lg"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl border-4 border-white mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {business.businessName?.charAt(0) || '?'}
            </div>
          )}
          <h1 className="mt-4 text-xl font-bold text-slate-900 tracking-tight">
            {business.businessName}
          </h1>
          {business.businessCategory && (
            <span
              className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              {business.businessCategory}
            </span>
          )}
          {business.description && (
            <p className="mt-3 text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{business.description}</p>
          )}
        </div>

        {/* CTA Buttons */}
        {ctas.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-8">
            {ctas.map((cta) => (
              <a
                key={cta.id}
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3.5 px-6 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                  cta.style === 'primary'
                    ? 'text-white'
                    : cta.style === 'secondary'
                    ? 'text-white opacity-90'
                    : 'border-2 bg-white'
                }`}
                style={
                  cta.style === 'outline'
                    ? { borderColor: primary, color: primary }
                    : { backgroundColor: cta.style === 'primary' ? primary : accent }
                }
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}

        {/* Social Links */}
        {links.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}10` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: primary }} />
                    </div>
                    <span className="font-medium text-sm text-slate-800">
                      {link.label || PLATFORM_LABELS[link.platform] || link.platform}
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-300 ml-auto group-hover:text-slate-400 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">Announcements</h2>
            <div className="flex flex-col gap-2">
              {announcements.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-start gap-2">
                    {item.isPinned && <Pin className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: primary }} />}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">{item.title}</h3>
                      {item.content && <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{item.content}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">Products & Services</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div
                      className="w-full h-24 flex items-center justify-center"
                      style={{ backgroundColor: `${primary}08` }}
                    >
                      <span className="text-2xl font-bold" style={{ color: `${primary}30` }}>
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-slate-900 text-sm">{product.name}</h3>
                    {product.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{product.description}</p>}
                    {product.price && (
                      <p className="mt-2 font-bold text-sm" style={{ color: primary }}>{product.price}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {(business.phone || business.address || business.businessHours) && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">Contact</h2>
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 space-y-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  {business.phone}
                </a>
              )}
              {business.address && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  {business.address}
                </div>
              )}
              {business.businessHours && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  {business.businessHours}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16">
          <a href="https://onnepal.com" className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-slate-500 transition-colors">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 flex items-center justify-center">
              <span className="text-[0.35rem] font-bold text-slate-400">ON</span>
            </div>
            Powered by OnNepal
          </a>
        </div>
      </div>
    </div>
  );
}
