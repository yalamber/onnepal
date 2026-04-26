'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClassifiedCategoryBySlug } from '@/lib/classified-categories';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';
import { CommentSection } from '@/components/comment-section';
import { MessageButton } from '@/components/message-button';
import { ImageUpload, imageUrl } from '@/components/image-upload';

interface ClassifiedListing {
  id: string;
  userId: string;
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

  if (images.length === 0) return null;

  return (
    <>
      {/* Main image */}
      <div className="w-full h-64 sm:h-80 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => setLightbox(true)}>
        <img src={imageUrl(images[activeIndex])!} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer transition-all ${
                i === activeIndex ? 'ring-2 ring-gray-950 opacity-100' : 'opacity-60 hover:opacity-100'
              }`}>
              <img src={imageUrl(img)!} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white cursor-pointer z-10">
            <span className="text-2xl">&times;</span>
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev - 1 + images.length) % images.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white cursor-pointer">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev + 1) % images.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white cursor-pointer">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img src={imageUrl(images[activeIndex])!} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-md"
            onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full">
              {images.map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`w-10 h-10 rounded-md overflow-hidden cursor-pointer transition-all ${i === activeIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}>
                  <img src={imageUrl(img)!} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
  const router = useRouter();
  const id = params.id as string;
  const [listing, setListing] = useState<ClassifiedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', category: '', location: '', contactPhone: '', contactWhatsapp: '' });
  const [editImages, setEditImages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null)
      .then((d: { user?: { id: string; isAdmin?: boolean } } | null) => {
        if (d?.user) { setCurrentUserId(d.user.id); if (d.user.isAdmin) setUserIsAdmin(true); }
      });
  }, []);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/classifieds/${id}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      setListing(data.listing || data);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchListing(); }, [id]);

  const startEdit = () => {
    if (!listing) return;
    setEditForm({
      title: listing.title, description: listing.description || '', price: listing.price || '',
      category: listing.category, location: listing.location || '',
      contactPhone: listing.contactPhone || '', contactWhatsapp: listing.contactWhatsapp || '',
    });
    setEditImages(parseImageUrls(listing.imageUrls));
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/classifieds/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim(), description: editForm.description.trim() || null,
          price: editForm.price.trim() || null, category: editForm.category,
          location: editForm.location.trim() || null, contactPhone: editForm.contactPhone.trim() || null,
          contactWhatsapp: editForm.contactWhatsapp.trim() || null,
          imageUrls: editImages.length > 0 ? editImages : null,
        }),
      });
      if (res.ok) { setEditing(false); await fetchListing(); }
    } finally { setSaving(false); }
  };

  const deleteListing = async () => {
    if (!confirm('Delete this ad?')) return;
    await fetch(`/api/classifieds/${id}`, { method: 'DELETE' });
    router.push('/classifieds');
  };

  const isOwner = currentUserId && (listing?.userId === currentUserId || userIsAdmin);

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

  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/classifieds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to classifieds
      </Link>

      {/* Top: image left + details right */}
      <div className={images.length > 0 ? 'grid lg:grid-cols-2 gap-6' : ''}>
        {images.length > 0 && (
          <div>
            {editing ? (
              <ImageUpload value={editImages} onChange={setEditImages} max={5} label="Photos" />
            ) : (
              <ImageGallery images={images} />
            )}
          </div>
        )}
        <div className="space-y-4">
          {editing ? (
            <div className="space-y-3">
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full h-12 px-0 text-lg font-semibold text-gray-950 border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  placeholder="Price" className={inputClass} />
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location" className={inputClass} />
              </div>
              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputClass}>
                {CLASSIFIED_CATEGORIES.map((parent) => (
                  <optgroup key={parent.slug} label={parent.name}>
                    {parent.subcategories.map((sub) => (
                      <option key={sub.slug} value={sub.name}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description..." rows={4}
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                  placeholder="Phone" className={inputClass} />
                <input type="tel" value={editForm.contactWhatsapp} onChange={(e) => setEditForm({ ...editForm, contactWhatsapp: e.target.value })}
                  placeholder="WhatsApp" className={inputClass} />
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={saving}
                  className="h-9 px-4 bg-gray-950 text-white text-xs font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors flex items-center gap-1.5">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5" /> Save</>}
                </button>
                <button onClick={() => setEditing(false)}
                  className="h-9 px-4 border border-gray-200 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950 leading-tight">{listing.title}</h1>
                {isOwner && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={startEdit} className="p-1.5 text-gray-400 hover:text-gray-950 cursor-pointer transition-colors" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={deleteListing} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {listing.price ? (
                <p className="text-2xl font-bold text-gray-950">Rs. {listing.price}</p>
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
                {listing.status === 'sold' && (
                  <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-md">Sold</span>
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
              {!isOwner && (
                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <MessageButton recipientId={listing.userId} listingType="classified" listingId={listing.id} listingTitle={listing.title} />
                  {(phoneUrl || whatsappUrl) && (
                    <div className="flex items-center gap-3 justify-center">
                      {phoneUrl && <a href={phoneUrl} className="text-xs text-gray-400 hover:text-gray-950 flex items-center gap-1 transition-colors"><Phone className="h-3 w-3" /> Call</a>}
                      {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-950 flex items-center gap-1 transition-colors"><MessageCircle className="h-3 w-3" /> WhatsApp</a>}
                    </div>
                  )}
                </div>
              )}
              {isOwner && listing.status === 'active' && (
                <button onClick={async () => {
                  await fetch(`/api/classifieds/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'sold' }) });
                  await fetchListing();
                }} className="text-xs text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">
                  Mark as sold
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs: Details / Comments */}
      {!editing && (
        <>
          <div className="flex gap-0 mt-6 border-b border-gray-100">
            {[
              { key: 'details' as const, label: 'Details' },
              { key: 'comments' as const, label: 'Comments' },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer relative ${
                  activeTab === tab.key ? 'text-gray-950' : 'text-gray-400 hover:text-gray-950'
                }`}>
                {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-950 rounded-full" />}
              </button>
            ))}
          </div>

          {activeTab === 'details' && listing.description && (
            <div className="mt-5">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}
          {activeTab === 'details' && !listing.description && (
            <p className="mt-5 text-sm text-gray-300">No description provided.</p>
          )}

          {activeTab === 'comments' && (
            <div className="mt-2">
              <CommentSection targetType="classified" targetId={listing.id} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
