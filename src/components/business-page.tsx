import {
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Globe, Mail, Phone, MapPin, Clock, MessageCircle, ExternalLink, Pin,
  ArrowUpRight,
} from 'lucide-react';

function imgSrc(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  return `https://images.onnepal.com/${key}`;
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
  const name = business.businessName || 'Business';
  const hasContact = business.phone || business.address || business.businessHours;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation bar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              {imgSrc(business.logoUrl) ? (
                <img src={imgSrc(business.logoUrl)} alt={name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primary }}>
                  {name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-bold text-gray-950">{name}</span>
            </div>
            <div className="flex items-center gap-4">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-950 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> {business.phone}
                </a>
              )}
              {ctas.length > 0 && (
                <a href={ctas[0].url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-1.5 text-sm font-medium rounded-lg text-white transition-colors"
                  style={{ backgroundColor: primary }}>
                  {ctas[0].label}
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative"
        style={{
          background: imgSrc(business.coverImageUrl)
            ? undefined
            : `linear-gradient(135deg, ${primary}, ${business.accentColor})`,
          backgroundImage: imgSrc(business.coverImageUrl) ? `url(${imgSrc(business.coverImageUrl)})` : undefined,
          backgroundSize: imgSrc(business.coverImageUrl) ? 'cover' : undefined,
          backgroundPosition: imgSrc(business.coverImageUrl)
            ? `${(business.coverPosition || '50 50').split(' ')[0]}% ${(business.coverPosition || '50 50').split(' ')[1]}%`
            : undefined,
        }}
      >
        <div className="relative bg-black/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="max-w-2xl">
              {business.businessCategory && (
                <p className="text-white/70 text-sm mb-3">{business.businessCategory}</p>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                {name}
              </h1>
              {business.description && (
                <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-lg">{business.description}</p>
              )}
              {ctas.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {ctas.map((cta, i) => (
                    <a key={cta.id} href={cta.url} target="_blank" rel="noopener noreferrer"
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                        i === 0
                          ? 'bg-white text-gray-950 hover:bg-gray-100'
                          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                      }`}>
                      {cta.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact bar */}
      {hasContact && (
        <section className="border-b border-gray-100 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-950 transition-colors">
                  <Phone className="h-4 w-4 text-gray-400" /> {business.phone}
                </a>
              )}
              {business.address && (
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" /> {business.address}
                </span>
              )}
              {business.businessHours && (
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" /> {business.businessHours}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products & Services */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Products & Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <div key={product.id} className="group">
                  {imgSrc(product.imageUrl) ? (
                    <img src={imgSrc(product.imageUrl)} alt={product.name} className="w-full h-48 lg:h-56 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-200">{product.name.charAt(0)}</span>
                    </div>
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

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">News & Updates</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {announcements.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-5">
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

      {/* Social Links */}
      {links.length > 0 && (
        <section className={`py-16 ${announcements.length > 0 ? '' : 'bg-gray-50/50'}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-8">Connect</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] || Globe;
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-950 transition-colors">
                      {link.label || PLATFORM_LABELS[link.platform] || link.platform}
                    </span>
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
                <img src={imgSrc(business.logoUrl)} alt={name} className="w-7 h-7 rounded-md object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: primary }}>
                  {name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-950">{name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hover:text-gray-950 transition-colors">{business.phone}</a>
              )}
              {business.address && <span>{business.address}</span>}
              <a href="https://onnepal.com" className="hover:text-gray-950 transition-colors">Powered by OnNepal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
