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
  const hasContact = business.phone || business.address || business.businessHours;
  const hasRightContent = products.length > 0 || announcements.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div
        className="h-40 sm:h-52 lg:h-64"
        style={{
          background: business.coverImageUrl
            ? `url(${business.coverImageUrl}) center/cover`
            : `linear-gradient(135deg, ${primary}, ${accent})`,
        }}
      />

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.businessName || ''}
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl border-4 border-white object-cover bg-white shadow-sm" />
          ) : (
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-sm"
              style={{ backgroundColor: primary }}>
              {business.businessName?.charAt(0) || '?'}
            </div>
          )}
          <div className="pb-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-950 tracking-tight">{business.businessName}</h1>
            {business.businessCategory && (
              <p className="text-sm text-gray-400 mt-1">{business.businessCategory}</p>
            )}
            {business.description && (
              <p className="text-gray-500 text-sm mt-2 max-w-lg leading-relaxed">{business.description}</p>
            )}
          </div>
        </div>

        {/* CTA Buttons — full width on mobile, inline on desktop */}
        {ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-10">
            {ctas.map((cta) => (
              <a key={cta.id} href={cta.url} target="_blank" rel="noopener noreferrer"
                className={`text-center py-3 px-6 rounded-lg font-medium text-sm transition-colors ${
                  cta.style === 'outline' ? 'border-2 bg-white' : 'text-white'
                }`}
                style={
                  cta.style === 'outline'
                    ? { borderColor: primary, color: primary }
                    : { backgroundColor: cta.style === 'primary' ? primary : accent }
                }>
                {cta.label}
              </a>
            ))}
          </div>
        )}

        {/* Two-column layout on desktop */}
        <div className={`flex flex-col ${hasRightContent ? 'lg:flex-row lg:gap-12' : ''}`}>
          {/* Left column — links + contact */}
          <div className={`${hasRightContent ? 'lg:w-80 lg:flex-shrink-0' : 'max-w-lg'}`}>
            {/* Contact info */}
            {hasContact && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h2>
                <div className="space-y-2">
                  {business.phone && (
                    <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-950 transition-colors py-1">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {business.phone}
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 py-1">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {business.address}
                    </div>
                  )}
                  {business.businessHours && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 py-1">
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {business.businessHours}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {links.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Links</h2>
                <div className="space-y-1">
                  {links.map((link) => {
                    const Icon = PLATFORM_ICONS[link.platform] || Globe;
                    return (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-gray-950 transition-colors">
                        <Icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
                        <span>{link.label || PLATFORM_LABELS[link.platform] || link.platform}</span>
                        <ExternalLink className="h-3 w-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — products + announcements */}
          {hasRightContent && (
            <div className="flex-1 min-w-0">
              {/* Products */}
              {products.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Products & Services</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-32 lg:h-40 object-cover" />
                        ) : (
                          <div className="w-full h-24 lg:h-32 bg-gray-50 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-200">{product.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-medium text-sm text-gray-950">{product.name}</h3>
                          {product.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{product.description}</p>}
                          {product.price && <p className="mt-2 font-semibold text-sm" style={{ color: primary }}>{product.price}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {announcements.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Announcements</h2>
                  <div className="space-y-3">
                    {announcements.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          {item.isPinned && <Pin className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: primary }} />}
                          <div>
                            <h3 className="font-medium text-sm text-gray-950">{item.title}</h3>
                            {item.content && <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.content}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-gray-100">
          <a href="https://onnepal.com" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
            Powered by OnNepal
          </a>
        </div>
      </div>
    </div>
  );
}
