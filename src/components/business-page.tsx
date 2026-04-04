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
  links: Array<{
    id: string;
    platform: string;
    url: string;
    label: string | null;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string | null;
    isPinned: boolean;
    createdAt: Date;
  }>;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string | null;
    imageUrl: string | null;
  }>;
  ctas: Array<{
    id: string;
    label: string;
    url: string;
    style: string;
  }>;
}

const PLATFORM_ICONS: Record<string, typeof Globe> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe,
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  viber: MessageCircle,
  tiktok: Globe,
  custom: ExternalLink,
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  website: 'Website',
  email: 'Email',
  phone: 'Phone',
  custom: 'Link',
};

export function BusinessPage({ business, links, announcements, products, ctas }: BusinessPageProps) {
  const primary = business.primaryColor;
  const accent = business.accentColor;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Cover / Header */}
      <div
        className="relative h-44 sm:h-52"
        style={{
          background: business.coverImageUrl
            ? `url(${business.coverImageUrl}) center/cover`
            : `linear-gradient(135deg, ${primary}, ${accent})`,
        }}
      >
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-14 relative z-10 pb-20">
        {/* Profile header */}
        <div className="text-center mb-8">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.businessName || ''}
              className="w-24 h-24 rounded-full border-[3px] border-white mx-auto object-cover bg-white shadow-sm"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full border-[3px] border-white mx-auto flex items-center justify-center text-white text-2xl font-semibold shadow-sm"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {business.businessName?.charAt(0) || '?'}
            </div>
          )}
          <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            {business.businessName}
          </h1>
          {business.businessCategory && (
            <span
              className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              {business.businessCategory}
            </span>
          )}
          {business.description && (
            <p className="mt-3 text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">{business.description}</p>
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
                className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:opacity-90 ${
                  cta.style === 'primary'
                    ? 'text-white'
                    : cta.style === 'secondary'
                    ? 'text-white opacity-85'
                    : 'border bg-white'
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
                    className="group flex items-center gap-3 p-3.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-150"
                  >
                    <Icon className="h-4.5 w-4.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                    <span className="font-medium text-sm text-gray-800">
                      {link.label || PLATFORM_LABELS[link.platform] || link.platform}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 ml-auto group-hover:text-gray-400 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Announcements</h2>
            <div className="flex flex-col gap-2.5">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-2">
                    {item.isPinned && <Pin className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">{item.title}</h3>
                      {item.content && (
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.content}</p>
                      )}
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
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Products & Services</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-28 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                    )}
                    {product.price && (
                      <p className="mt-2 font-semibold text-sm" style={{ color: primary }}>
                        {product.price}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(business.phone || business.address || business.businessHours) && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Contact</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {business.phone}
                </a>
              )}
              {business.address && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  {business.address}
                </div>
              )}
              {business.businessHours && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span>{business.businessHours}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-16">
          <a
            href="https://onnepal.com"
            className="hover:text-gray-500 transition-colors"
          >
            Powered by OnNepal
          </a>
        </div>
      </div>
    </div>
  );
}
