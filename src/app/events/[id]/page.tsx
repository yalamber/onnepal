'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, MessageCircle, Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';
import { CommentSection } from '@/components/comment-section';

interface Event {
  id: string; title: string; description: string | null; category: string;
  startDate: string; endDate: string | null; startTime: string | null; endTime: string | null;
  venue: string | null; location: string | null; ticketPrice: string | null; ticketUrl: string | null;
  contactPhone: string | null; contactWhatsapp: string | null; imageUrls: string | null;
  status: string; createdAt: string; userName: string | null;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/events/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Event } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-sm text-gray-500 mb-4">Event not found</p><Link href="/events" className="text-sm text-gray-400 hover:text-gray-950">Back to Events</Link></div>;

  const images: string[] = item.imageUrls ? (() => { try { return JSON.parse(item.imageUrls) as string[]; } catch { return []; } })() : [];
  const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/events" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Events</Link>

        {images.length > 0 && (
          <div className="relative mb-6 rounded-md overflow-hidden bg-gray-50">
            <img src={imageUrl(images[imgIdx])!} alt={item.title} className="w-full h-64 sm:h-80 object-cover" loading="eager" decoding="async" />
            {images.length > 1 && (<>
              <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-md cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-md cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
            </>)}
          </div>
        )}

        <span className="text-xs text-gray-400">{item.category}</span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-950 mt-1">{item.title}</h1>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" /> {fmtDate(item.startDate)}{item.endDate && item.endDate !== item.startDate ? ` – ${fmtDate(item.endDate)}` : ''}</span>
          {item.startTime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}</span>}
          {item.venue && <span>{item.venue}</span>}
          {item.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {item.location}</span>}
        </div>

        {item.ticketPrice && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-950">{item.ticketPrice}</span>
            {item.ticketUrl && <a href={item.ticketUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Get tickets</a>}
          </div>
        )}

        {item.description && <div className="mt-6 pt-6 border-t border-gray-100"><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p></div>}

        {(item.contactPhone || item.contactWhatsapp) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-950 mb-3">Contact</p>
            <div className="flex flex-wrap gap-3">
              {item.contactPhone && <a href={`tel:${item.contactPhone}`} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Phone className="h-4 w-4" /> {item.contactPhone}</a>}
              {item.contactWhatsapp && <a href={`https://wa.me/${item.contactWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">Posted by {item.userName || 'Anonymous'} · {new Date(item.createdAt).toLocaleDateString()}</p>

        <CommentSection targetType="event" targetId={item.id} />
      </div>
    </div>
  );
}
