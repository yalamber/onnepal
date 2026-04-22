import { ArrowRight } from 'lucide-react';

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
  const primary = business.primaryColor || '#2563eb';
  const accent = business.accentColor || '#1d4ed8';
  const name = business.businessName || 'Unnamed Business';
  const initial = name.charAt(0).toUpperCase();

  return (
    <a
      href={`https://${business.subdomain}.onnepal.com`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
            }}
          >
            {initial}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>

          {business.businessCategory && (
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              {business.businessCategory}
            </span>
          )}

          {business.description && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
              {business.description}
            </p>
          )}
        </div>
      </div>

      {/* Visit link */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono truncate">
          {business.subdomain}.onnepal.com
        </span>
        <span className="text-sm text-indigo-600 font-medium flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Visit
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}

export function BusinessCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-5 w-32 bg-gray-200 rounded-lg" />
          <div className="mt-2 h-4 w-20 bg-gray-100 rounded-full" />
          <div className="mt-3 space-y-1.5">
            <div className="h-3.5 w-full bg-gray-100 rounded" />
            <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="h-3.5 w-36 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
