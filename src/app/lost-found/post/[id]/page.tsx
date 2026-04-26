'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Phone, MessageCircle, Loader2, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';
import { CommentSection } from '@/components/comment-section';

interface Item {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  itemDate: string | null;
  reward: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  imageUrls: string | null;
  status: string;
  createdAt: string;
  userName: string | null;
}

export default function LostFoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/lost-found/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { item: Item } | null) => { if (data) setItem(data.item); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-500 mb-4">Item not found</p>
      <Link href="/lost-found" className="text-sm text-gray-400 hover:text-gray-950">Back to Lost & Found</Link>
    </div>
  );

  const images: string[] = item.imageUrls ? (() => { try { return JSON.parse(item.imageUrls) as string[]; } catch { return []; } })() : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/lost-found" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Lost & Found
        </Link>

        {/* Images */}
        {images.length > 0 && (
          <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-50">
            <img src={imageUrl(images[imgIdx])!} alt={item.title}
              className="w-full h-64 sm:h-80 object-cover" loading="eager" decoding="async" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-md cursor-pointer hover:bg-black/70">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-md cursor-pointer hover:bg-black/70">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">{imgIdx + 1}/{images.length}</div>
              </>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className={`px-2 py-0.5 text-xs font-semibold uppercase rounded ${
            item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {item.type}
          </span>
          <span className="text-sm text-gray-400">{item.category}</span>
          {item.status === 'resolved' && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">Resolved</span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{item.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-500">
          {item.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {item.location}</span>}
          {item.itemDate && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400" /> {item.type === 'lost' ? 'Lost' : 'Found'} on {item.itemDate}</span>}
          <span className="text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {item.userName && <span className="text-gray-400">by {item.userName}</span>}
        </div>

        {item.reward && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-md">
            Reward: {item.reward}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Contact */}
        {(item.contactPhone || item.contactWhatsapp) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-950 mb-3">Contact</p>
            <div className="flex flex-wrap gap-3">
              {item.contactPhone && (
                <a href={`tel:${item.contactPhone}`}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Phone className="h-4 w-4" /> {item.contactPhone}
                </a>
              )}
              {item.contactWhatsapp && (
                <a href={`https://wa.me/${item.contactWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        <CommentSection targetType="lost-found" targetId={item.id} />
      </div>
    </div>
  );
}
