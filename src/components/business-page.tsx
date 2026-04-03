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
    <div className="min-h-screen bg-white">
      {/* Cover / Header */}
      <div
        className="relative h-48 sm:h-56"
        style={{
          background: business.coverImageUrl
            ? `url(${business.coverImageUrl}) center/cover`
            : `linear-gradient(135deg, ${primary}, ${accent})`,
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        {/* Profile header */}
        <div className="text-center mb-8">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.businessName || ''}
              className="w-28 h-28 rounded-full border-4 border-white mx-auto object-cover bg-white"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full border-4 border-white mx-auto flex items-center justify-center text-white text-3xl font-bold"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {business.businessName?.charAt(0) || '?'}
            </div>
          )}
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-900">
            {business.businessName}
          </h1>
          {business.businessCategory && (
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: primary }}
            >
              {business.businessCategory}
            </span>
          )}
          {business.description && (
            <p className="mt-4 text-gray-600 max-w-md mx-auto">{business.description}</p>
          )}
        </div>

        {/* CTA Buttons */}
        {ctas.length > 0 && (
          <div className="flex flex-col gap-3 mb-8">
            {ctas.map((cta) => (
              <a
                key={cta.id}
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold text-lg transition-colors hover:opacity-90 ${
                  cta.style === 'primary'
                    ? 'text-white'
                    : cta.style === 'secondary'
                    ? 'text-white opacity-80'
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
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {link.label || PLATFORM_LABELS[link.platform] || link.platform}
                    </span>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
            <div className="flex flex-col gap-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-2">
                    {item.isPinned && <Pin className="h-4 w-4 text-indigo-500 mt-1 flex-shrink-0" />}
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {item.content && (
                        <p className="text-gray-600 text-sm mt-1">{item.content}</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products & Services</h2>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                    )}
                    {product.price && (
                      <p className="mt-2 font-bold text-sm" style={{ color: primary }}>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                  <Phone className="h-5 w-5 text-gray-400" />
                  {business.phone}
                </a>
              )}
              {business.address && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  {business.address}
                </div>
              )}
              {business.businessHours && (
                <div className="flex items-start gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-sm">{business.businessHours}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-12">
          <a
            href="https://onnepal.com"
            className="hover:text-gray-600 transition-colors"
          >
            Powered by OnNepal
          </a>
        </div>
      </div>
    </div>
  );
}
