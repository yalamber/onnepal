'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  Clock,
  User,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClassifiedCategoryBySlug } from '@/lib/classified-categories';
import { CommentSection } from '@/components/comment-section';

interface ClassifiedListing {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  category: string;
  location: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  imageUrls: string | null;
  status: string;
  createdAt: string;
  userName: string | null;
  userSubdomain: string | null;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return `${diffMonth}mo ago`;
}

function parseImageUrls(imageUrls: string | null): string[] {
  if (!imageUrls) return [];
  try {
    const parsed = JSON.parse(imageUrls);
    if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === 'string' && u.length > 0);
  } catch {
    // not valid JSON
  }
  return [];
}

function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex flex-col items-center justify-center gap-2">
        <ImageOff className="h-10 w-10 text-gray-200" />
        <p className="text-xs text-gray-300">No images</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 sm:h-80 rounded-md overflow-hidden bg-gray-100">
        <img
          src={images[activeIndex]}
          alt={`Image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/50 text-white text-xs">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                i === activeIndex ? 'border-gray-950' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
      <div className="w-full h-64 bg-gray-200 rounded-md mb-6" />
      <div className="h-8 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="h-7 w-32 bg-gray-200 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
      <div className="space-y-2 mb-8">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-12 flex-1 bg-gray-200 rounded-xl" />
        <div className="h-12 flex-1 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function ClassifiedDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [listing, setListing] = useState<ClassifiedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/classifieds/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setListing(data.listing || data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/classifieds"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to classifieds
        </Link>
        <div className="text-center py-20 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <ImageOff className="h-7 w-7 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Listing not found</h2>
          <p className="text-sm text-gray-400 mb-6">
            This classified ad may have been removed or doesn&apos;t exist.
          </p>
          <Button asChild className="bg-gray-950 hover:bg-gray-800 text-white">
            <Link href="/classifieds">Browse classifieds</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = parseImageUrls(listing.imageUrls);
  const category = getClassifiedCategoryBySlug(listing.category);
  const categoryLabel = category ? `${category.icon} ${category.name}` : listing.category;

  const whatsappUrl = listing.contactWhatsapp
    ? `https://wa.me/${listing.contactWhatsapp.replace(/[^0-9]/g, '')}`
    : null;

  const phoneUrl = listing.contactPhone
    ? `tel:${listing.contactPhone}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/classifieds"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classifieds
      </Link>

      <div>
        {/* Image gallery */}
        <ImageGallery images={images} />

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-950 leading-tight">
            {listing.title}
          </h1>

          {/* Price */}
          <div>
            {listing.price ? (
              <span className="text-xl font-bold text-gray-950">
                Rs. {listing.price}
              </span>
            ) : (
              <span className="text-sm text-gray-400">
                Contact for price
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {categoryLabel && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                <Tag className="h-3 w-3" />
                {categoryLabel}
              </span>
            )}
            {listing.location && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <MapPin className="h-3 w-3" />
                {listing.location}
              </span>
            )}
          </div>

          {/* Posted info */}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(listing.createdAt)}
            </span>
            {listing.userName && (
              <>
                <span className="text-gray-200">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {listing.userSubdomain ? (
                    <a
                      href={`https://${listing.userSubdomain}.onnepal.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-950 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      {listing.userName}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-gray-500 font-medium">{listing.userName}</span>
                  )}
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Description */}
          {listing.description ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-300 italic">No description provided.</p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Contact section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {phoneUrl && (
                <a
                  href={phoneUrl}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call {listing.contactPhone}
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-lg border border-gray-200 text-gray-950 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {!phoneUrl && !whatsappUrl && (
                <p className="text-sm text-gray-400 italic">No contact information provided.</p>
              )}
            </div>
          </div>

          <CommentSection targetType="classified" targetId={listing.id} />
        </div>
      </div>
    </div>
  );
}
