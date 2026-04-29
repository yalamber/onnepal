'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, Loader2, ExternalLink } from 'lucide-react';
import { imageUrl, ImageUpload } from '@/components/image-upload';
import { parseImageUrls } from '@/lib/image-utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ImageGallery } from '@/components/image-gallery';
import { OwnerActions } from '@/components/owner-actions';
import { ContactLinks } from '@/components/contact-links';
import { SaveCancelButtons } from '@/components/form-buttons';
import { CommentSection } from '@/components/comment-section';

interface Event {
  id: string; userId: string; title: string; description: string | null; category: string;
  startDate: string; endDate: string | null; startTime: string | null; endTime: string | null;
  venue: string | null; location: string | null; ticketPrice: string | null; ticketUrl: string | null;
  contactPhone: string | null; contactWhatsapp: string | null; imageUrls: string | null;
  status: string; createdAt: string; userName: string | null;
}

export default function EventDetailPage({ initialData }: { initialData?: Event | null }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isOwner } = useCurrentUser();
  const [item, setItem] = useState<Event | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    fetch(`/api/events/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Event } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  const owner = item && isOwner(item.userId);
  const deleteItem = async () => {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    router.push('/events');
  };

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', startDate: '', endDate: '', startTime: '', endTime: '', venue: '', location: '', ticketPrice: '', ticketUrl: '', contactPhone: '', contactWhatsapp: '' });
  const [editImages, setEditImages] = useState<string[]>([]);

  const startEdit = () => {
    if (!item) return;
    setEditForm({
      title: item.title, description: item.description || '', category: item.category,
      startDate: item.startDate, endDate: item.endDate || '', startTime: item.startTime || '',
      endTime: item.endTime || '', venue: item.venue || '', location: item.location || '',
      ticketPrice: item.ticketPrice || '', ticketUrl: item.ticketUrl || '',
      contactPhone: item.contactPhone || '', contactWhatsapp: item.contactWhatsapp || '',
    });
    setEditImages(parseImageUrls(item.imageUrls));
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/events/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title, description: editForm.description || null, category: editForm.category,
          startDate: editForm.startDate, endDate: editForm.endDate || null, startTime: editForm.startTime || null,
          endTime: editForm.endTime || null, venue: editForm.venue || null, location: editForm.location || null,
          ticketPrice: editForm.ticketPrice || null, ticketUrl: editForm.ticketUrl || null,
          contactPhone: editForm.contactPhone || null, contactWhatsapp: editForm.contactWhatsapp || null,
          imageUrls: editImages.length > 0 ? editImages : null,
        }),
      });
      setEditing(false);
      const res = await fetch(`/api/events/${id}`);
      if (res.ok) { const d = await res.json() as { item: Event }; setItem(d.item); }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-sm text-gray-500 mb-4">Event not found</p><Link href="/events" className="text-sm text-gray-400 hover:text-gray-950">Back to Events</Link></div>;

  const images = parseImageUrls(item.imageUrls).map(k => imageUrl(k)!);
  const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const inputClass = "h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/events" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Events</Link>

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
                  <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className={inputClass} />
                  <input type="text" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    placeholder="Venue" className={inputClass} />
                </div>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location" className={`w-full ${inputClass}`} />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description" rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editForm.ticketPrice} onChange={(e) => setEditForm({ ...editForm, ticketPrice: e.target.value })}
                    placeholder="Ticket price" className={inputClass} />
                  <input type="text" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    placeholder="Phone" className={inputClass} />
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
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /> {fmtDate(item.startDate)}{item.endDate && item.endDate !== item.startDate ? ` – ${fmtDate(item.endDate)}` : ''}</p>
              {item.startTime && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /> {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}</p>}
              {item.venue && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {item.venue}{item.location ? `, ${item.location}` : ''}</p>}
              {!item.venue && item.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {item.location}</p>}
            </div>

            {item.ticketPrice && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-950 mb-2">{item.ticketPrice}</p>
                {item.ticketUrl && (
                  <a href={item.ticketUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm transition-colors">
                    <ExternalLink className="h-4 w-4" /> Get tickets
                  </a>
                )}
              </div>
            )}

            <ContactLinks phone={item.contactPhone} whatsapp={item.contactWhatsapp} />
          </div>
        </div>

        {item.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About this event</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">Posted by {item.userName || 'Anonymous'} · {new Date(item.createdAt).toLocaleDateString()}</p>

        <CommentSection targetType="event" targetId={item.id} />
      </div>
    </div>
  );
}
