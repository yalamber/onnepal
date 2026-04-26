'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Phone, MessageCircle, Loader2, AlertTriangle, Eye, ChevronLeft, ChevronRight, Trash2, Check } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';
import { CommentSection } from '@/components/comment-section';
import { MessageButton } from '@/components/message-button';

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
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null)
      .then((d: { user?: { id: string; isAdmin?: boolean } } | null) => {
        if (d?.user) { setCurrentUserId(d.user.id); if (d.user.isAdmin) setUserIsAdmin(true); }
      });
  }, []);

  const fetchItem = async () => {
    const res = await fetch(`/api/lost-found/${id}`);
    if (res.ok) { const data = await res.json() as { item: Item }; setItem(data.item); }
  };

  useEffect(() => {
    fetch(`/api/lost-found/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { item: Item } | null) => { if (data) setItem(data.item); })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = currentUserId && item && (item.userId === currentUserId || userIsAdmin);
  const deleteItem2 = async () => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/lost-found/${id}`, { method: 'DELETE' });
    router.push('/lost-found');
  };
  const resolveItem = async () => {
    await fetch(`/api/lost-found/${id}`, { method: 'PATCH' });
    await fetchItem();
  };

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/lost-found" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Lost & Found
        </Link>

        {/* Top: image left + details right (or single column if no images) */}
        <div className={images.length > 0 ? 'grid lg:grid-cols-2 gap-6' : ''}>
          {images.length > 0 && (
            <div>
              <div className="relative rounded-md overflow-hidden bg-gray-50">
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
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-semibold uppercase rounded ${item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{item.type}</span>
              <span className="text-xs text-gray-400">{item.category}</span>
              {item.status === 'resolved' && <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">Resolved</span>}
            </div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{item.title}</h1>
              {isOwner && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.status === 'open' && (
                    <button onClick={resolveItem} className="p-1.5 text-gray-400 hover:text-green-600 cursor-pointer transition-colors" title="Mark resolved">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={deleteItem2} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
              {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" /> {item.location}</span>}
              {item.itemDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-400" /> {item.type === 'lost' ? 'Lost' : 'Found'} on {item.itemDate}</span>}
              <span className="text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              {item.userName && <span className="text-gray-400">by {item.userName}</span>}
            </div>
            {item.reward && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-md">
                Reward: {item.reward}
              </div>
            )}
            <div className="border-t border-gray-100 pt-4 space-y-2.5">
              <MessageButton recipientId={item.userId} listingType="lost-found" listingId={item.id} listingTitle={item.title} />
              {(item.contactPhone || item.contactWhatsapp) && (
                <div className="flex items-center gap-3 justify-center">
                  {item.contactPhone && <a href={`tel:${item.contactPhone}`} className="text-xs text-gray-400 hover:text-gray-950 flex items-center gap-1 transition-colors"><Phone className="h-3 w-3" /> Call</a>}
                  {item.contactWhatsapp && <a href={`https://wa.me/${item.contactWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-950 flex items-center gap-1 transition-colors"><MessageCircle className="h-3 w-3" /> WhatsApp</a>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Below: full-width description + comments */}
        {item.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        <CommentSection targetType="lost-found" targetId={item.id} />
      </div>
    </div>
  );
}
