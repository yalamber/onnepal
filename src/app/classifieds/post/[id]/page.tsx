'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, Tag, Clock, User, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClassifiedCategoryBySlug, CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';
import { ImageUpload, imageUrl } from '@/components/image-upload';
import { parseImageUrls } from '@/lib/image-utils';
import { timeAgo } from '@/lib/time-ago';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ImageGallery } from '@/components/image-gallery';
import { OwnerActions } from '@/components/owner-actions';
import { ContactLinks } from '@/components/contact-links';
import { SaveCancelButtons } from '@/components/form-buttons';
import { CommentSection } from '@/components/comment-section';
import { MessageButton } from '@/components/message-button';

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

export default function ClassifiedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { userId, isOwner } = useCurrentUser();
  const [listing, setListing] = useState<ClassifiedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', category: '', location: '', contactPhone: '', contactWhatsapp: '' });
  const [editImages, setEditImages] = useState<string[]>([]);

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

  const owner = listing && isOwner(listing.userId);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
      <div className="w-full h-64 bg-gray-200 rounded-md mb-6" />
      <div className="h-8 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="h-7 w-32 bg-gray-200 rounded mb-4" />
    </div>
  );

  if (notFound || !listing) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/classifieds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to classifieds
      </Link>
      <div className="text-center py-20 rounded-lg border-2 border-dashed border-gray-200">
        <ImageOff className="h-7 w-7 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Listing not found</h2>
        <p className="text-sm text-gray-400 mb-6">This classified ad may have been removed.</p>
        <Button asChild><Link href="/classifieds">Browse classifieds</Link></Button>
      </div>
    </div>
  );

  const images = parseImageUrls(listing.imageUrls).map(k => imageUrl(k)!);
  const category = getClassifiedCategoryBySlug(listing.category);
  const categoryLabel = category ? `${category.icon} ${category.name}` : listing.category;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/classifieds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to classifieds
      </Link>

      <div className={images.length > 0 || editing ? 'grid lg:grid-cols-2 gap-6' : ''}>
        {(images.length > 0 || editing) && (
          <div>
            {editing ? (
              <ImageUpload value={editImages} onChange={setEditImages} max={5} label="Photos" />
            ) : (
              <ImageGallery images={images} alt={listing.title} />
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
              <SaveCancelButtons saving={saving} onSave={saveEdit} onCancel={() => setEditing(false)} />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950 leading-tight">{listing.title}</h1>
                {owner && <OwnerActions onEdit={startEdit} onDelete={deleteListing} />}
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
                    <span className="text-gray-200">&middot;</span>
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
                {userId !== listing.userId && (
                  <MessageButton recipientId={listing.userId} listingType="classified" listingId={listing.id} listingTitle={listing.title} />
                )}
                <ContactLinks phone={listing.contactPhone} whatsapp={listing.contactWhatsapp} />
              </div>
              {owner && listing.status === 'active' && (
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

      {!editing && (
        <>
          <div className="flex gap-0 mt-6 border-b border-gray-100">
            {([
              { key: 'details' as const, label: 'Details' },
              { key: 'comments' as const, label: 'Comments' },
            ]).map((tab) => (
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
