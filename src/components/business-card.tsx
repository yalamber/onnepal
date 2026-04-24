import { ArrowUpRight } from 'lucide-react';

function imgSrc(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  return `https://images.onnepal.com/${key}`;
}

export interface BusinessCardData {
  id: string;
  subdomain: string | null;
  businessName: string | null;
  businessCategory: string | null;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
}

interface BusinessCardProps {
  business: BusinessCardData;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const primary = business.primaryColor || '#1e293b';
  const accent = business.accentColor || '#334155';
  const name = business.businessName || 'Unnamed';

  return (
    <a
      href={`https://${business.subdomain}.onnepal.com`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-5 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
    >
      <div className="flex items-start gap-4">
        {imgSrc(business.logoUrl) ? (
          <img src={imgSrc(business.logoUrl)!} alt={name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: primary }}
          >
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-950 truncate">{name}</h3>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
          </div>
          {business.businessCategory && (
            <p className="text-xs text-gray-400 mt-0.5">{business.businessCategory}</p>
          )}
          {business.description && (
            <p className="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-2">{business.description}</p>
          )}
        </div>
      </div>
    </a>
  );
}

export function BusinessCardSkeleton() {
  return (
    <div className="p-5 border border-gray-100 rounded-lg animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-28 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-50 rounded mt-2" />
          <div className="h-3 w-full bg-gray-50 rounded mt-3" />
        </div>
      </div>
    </div>
  );
}
