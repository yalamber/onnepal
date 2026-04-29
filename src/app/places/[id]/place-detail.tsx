'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2, ExternalLink } from 'lucide-react';
import { imageUrl, ImageUpload } from '@/components/image-upload';
import { parseImageUrls } from '@/lib/image-utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ImageGallery } from '@/components/image-gallery';
import { OwnerActions } from '@/components/owner-actions';
import { ContactLinks } from '@/components/contact-links';
import { SaveCancelButtons } from '@/components/form-buttons';
import { CommentSection } from '@/components/comment-section';
import { CitySelector } from '@/components/city-selector';
import { toast } from 'sonner';

interface Place {
  id: string; userId: string; title: string; description: string | null; category: string;
  location: string | null; city: string | null; address: string | null;
  imageUrls: string | null; contactPhone: string | null; contactWhatsapp: string | null;
  website: string | null; status: string; createdAt: string; userName: string | null;
}


export default function PlaceDetailPage({ initialData }: { initialData?: Place | null }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isOwner } = useCurrentUser();
  const [item, setItem] = useState<Place | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    fetch(`/api/places/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Place } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  const owner = item && isOwner(item.userId);
  const deleteItem = async () => {
    if (!confirm('Delete this place?')) return;
    const res = await fetch(`/api/places/${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Failed to delete'); return; }
    toast.success('Place deleted');
    router.push('/places');
  };

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', location: '', city: '', address: '', website: '', contactPhone: '', contactWhatsapp: '' });
  const [editImages, setEditImages] = useState<string[]>([]);

  const startEdit = () => {
    if (!item) return;
    setEditForm({
      title: item.title, description: item.description || '', category: item.category,
      location: item.location || '', city: item.city || '', address: item.address || '',
      website: item.website || '', contactPhone: item.contactPhone || '', contactWhatsapp: item.contactWhatsapp || '',
    });
    setEditImages(parseImageUrls(item.imageUrls));
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/places/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title, description: editForm.description || null, category: editForm.category,
          location: editForm.location || null, city: editForm.city || null,
          address: editForm.address || null, website: editForm.website || null,
          contactPhone: editForm.contactPhone || null, contactWhatsapp: editForm.contactWhatsapp || null,
          imageUrls: editImages.length > 0 ? editImages : null,
        }),
      });
      setEditing(false);
      const res = await fetch(`/api/places/${id}`);
      if (res.ok) { const d = await res.json() as { item: Place }; setItem(d.item); }
      toast.success('Changes saved');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-sm text-gray-500 mb-4">Place not found</p><Link href="/places" className="text-sm text-gray-400 hover:text-gray-950">Back to Places</Link></div>;

  const images = parseImageUrls(item.imageUrls).map(k => imageUrl(k)!);
  const inputClass = "h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/places" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Places</Link>

        <div className={(images.length > 0 || editing) ? 'grid lg:grid-cols-2 gap-6' : ''}>
          {(images.length > 0 || editing) && (
            <div>
              {editing ? (
                <ImageUpload value={editImages} onChange={setEditImages} max={5} label="Photos" />
              ) : (
                <ImageGallery images={images} alt={item.title} />
              )}
            </div>
          )}
          <div className="space-y-4">
            {editing ? (
              <div className="space-y-3">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={`w-full ${inputClass}`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location" className={inputClass} />
                  <CitySelector value={editForm.city} onChange={(v) => setEditForm({ ...editForm, city: v })} className={inputClass} />
                </div>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Address" className={`w-full ${inputClass}`} />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description" rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
                <input type="text" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Website URL" className={`w-full ${inputClass}`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    placeholder="Phone" className={inputClass} />
                  <input type="text" value={editForm.contactWhatsapp} onChange={(e) => setEditForm({ ...editForm, contactWhatsapp: e.target.value })}
                    placeholder="WhatsApp" className={inputClass} />
                </div>
                <SaveCancelButtons saving={saving} onSave={saveEdit} onCancel={() => setEditing(false)} />
              </div>
            ) : (
              <>
                <span className="text-xs text-gray-400">{item.category}</span>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{item.title}</h1>
                  {owner && <OwnerActions onEdit={startEdit} onDelete={deleteItem} />}
                </div>
              </>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              {(item.location || item.city) && (
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {[item.location, item.city].filter(Boolean).join(', ')}</p>
              )}
              {item.address && <p className="text-sm text-gray-500">{item.address}</p>}
            </div>

            {item.website && (
              <div className="pt-3 border-t border-gray-100">
                <a href={item.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm transition-colors">
                  <ExternalLink className="h-4 w-4" /> Visit website
                </a>
              </div>
            )}

            <ContactLinks phone={item.contactPhone} whatsapp={item.contactWhatsapp} />
          </div>
        </div>

        {item.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About this place</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">Posted by {item.userName || 'Anonymous'} · {new Date(item.createdAt).toLocaleDateString()}</p>

        <CommentSection targetType="place" targetId={item.id} />
      </div>
    </div>
  );
}
