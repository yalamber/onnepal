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
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className="w-full h-64 sm:h-80 rounded-md overflow-hidden bg-gray-100 cursor-pointer" onClick={() => { setActiveIndex(0); setLightbox(true); }}>
        <img src={images[0]} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <>
      {/* Grid layout: hero + side images */}
      <div className="grid grid-cols-2 gap-1.5 h-64 sm:h-80">
        {/* Main image */}
        <div className={`${images.length === 2 ? 'col-span-1' : 'row-span-2'} rounded-md overflow-hidden bg-gray-100 cursor-pointer`}
          onClick={() => { setActiveIndex(0); setLightbox(true); }}>
          <img src={images[0]} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
        </div>

        {/* Side images */}
        {images.length === 2 ? (
          <div className="rounded-md overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => { setActiveIndex(1); setLightbox(true); }}>
            <img src={images[1]} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
          </div>
        ) : (
          <div className="grid grid-rows-2 gap-1.5">
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => { setActiveIndex(1); setLightbox(true); }}>
              <img src={images[1]} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
            </div>
            <div className="relative rounded-md overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => { setActiveIndex(2); setLightbox(true); }}>
              <img src={images[2]} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
              {images.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">+{images.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white cursor-pointer z-10">
            <span className="text-2xl">&times;</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white cursor-pointer">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white cursor-pointer">
            <ChevronRight className="h-6 w-6" />
          </button>
          <img src={images[activeIndex]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-md"
            onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${i === activeIndex ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}
    </>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/classifieds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to classifieds
      </Link>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column: images + description */}
        <div className="lg:col-span-3 space-y-5">
          <ImageGallery images={images} />

          <h1 className="text-xl sm:text-2xl font-bold text-gray-950 leading-tight lg:hidden">{listing.title}</h1>

          {listing.description && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          <CommentSection targetType="classified" targetId={listing.id} />
        </div>

        {/* Right column: details + contact (sticky) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4">
            <h1 className="text-xl font-bold text-gray-950 leading-tight hidden lg:block">{listing.title}</h1>

            {listing.price ? (
              <p className="text-xl font-bold text-gray-950">Rs. {listing.price}</p>
            ) : (
              <p className="text-sm text-gray-400">Contact for price</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {categoryLabel && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                  <Tag className="h-3 w-3" /> {categoryLabel}
                </span>
              )}
              {listing.location && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                  <MapPin className="h-3 w-3" /> {listing.location}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(listing.createdAt)}</span>
              {listing.userName && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {listing.userSubdomain ? (
                      <a href={`https://${listing.userSubdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-950 font-medium transition-colors">{listing.userName}</a>
                    ) : listing.userName}
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2.5">
              {phoneUrl && (
                <a href={phoneUrl}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm transition-colors">
                  <Phone className="h-4 w-4" /> Call {listing.contactPhone}
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-gray-200 text-gray-950 font-medium text-sm hover:bg-gray-50 transition-colors">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {!phoneUrl && !whatsappUrl && (
                <p className="text-sm text-gray-400">No contact information provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
