'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, MessageCircle, Loader2, ExternalLink, ChevronLeft, ChevronRight, Trash2, Edit2, Check, X } from 'lucide-react';
import { imageUrl, ImageUpload } from '@/components/image-upload';
import { CommentSection } from '@/components/comment-section';

interface Event {
  id: string; userId: string; title: string; description: string | null; category: string;
  startDate: string; endDate: string | null; startTime: string | null; endTime: string | null;
  venue: string | null; location: string | null; ticketPrice: string | null; ticketUrl: string | null;
  contactPhone: string | null; contactWhatsapp: string | null; imageUrls: string | null;
  status: string; createdAt: string; userName: string | null;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Event | null>(null);
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

  useEffect(() => {
    fetch(`/api/events/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Event } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  const isOwner = currentUserId && item && (item.userId === currentUserId || userIsAdmin);
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
    const imgs: string[] = item.imageUrls ? (() => { try { return JSON.parse(item.imageUrls) as string[]; } catch { return []; } })() : [];
    setEditImages(imgs);
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

  const images: string[] = item.imageUrls ? (() => { try { return JSON.parse(item.imageUrls) as string[]; } catch { return []; } })() : [];
  const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/events" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Events</Link>

        {/* Top: image left + event info right (or single column if no images) */}
        <div className={images.length > 0 ? 'grid lg:grid-cols-2 gap-6' : ''}>
          {images.length > 0 && (
            <div>
              <div className="relative rounded-md overflow-hidden bg-gray-50">
                <img src={imageUrl(images[imgIdx])!} alt={item.title} className="w-full h-64 sm:h-80 object-cover" loading="eager" decoding="async" />
                {images.length > 1 && (<>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-md cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-md cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
                </>)}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {editing ? (
              <div className="space-y-3">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                  <input type="text" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    placeholder="Venue" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description" rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editForm.ticketPrice} onChange={(e) => setEditForm({ ...editForm, ticketPrice: e.target.value })}
                    placeholder="Ticket price" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                  <input type="text" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    placeholder="Phone" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <ImageUpload value={editImages} onChange={setEditImages} max={5} label="Photos" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="h-9 px-4 bg-gray-950 text-white text-xs font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 cursor-pointer flex items-center gap-1.5">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5" /> Save</>}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="h-9 px-4 border border-gray-200 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 cursor-pointer">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-xs text-gray-400">{item.category}</span>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{item.title}</h1>
                  {isOwner && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={startEdit} className="p-1.5 text-gray-400 hover:text-gray-950 cursor-pointer transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={deleteItem} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
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

            {(item.contactPhone || item.contactWhatsapp) && (
              <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {item.contactPhone && (
                  <a href={`tel:${item.contactPhone}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                    <Phone className="h-4 w-4" /> {item.contactPhone}
                  </a>
                )}
                {item.contactWhatsapp && (
                  <a href={`https://wa.me/${item.contactWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white text-sm transition-colors">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Below: full-width description + comments */}
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
