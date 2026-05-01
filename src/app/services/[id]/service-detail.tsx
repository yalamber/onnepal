'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { ShareButtons } from '@/components/share-buttons';
import { imageUrl } from '@/components/image-upload';
import { parseImageUrls } from '@/lib/image-utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ImageGallery } from '@/components/image-gallery';
import { OwnerActions } from '@/components/owner-actions';
import { ContactLinks } from '@/components/contact-links';
import { CommentSection } from '@/components/comment-section';
import { BookmarkButton } from '@/components/bookmark-button';
import { ReportButton } from '@/components/report-button';
import { toast } from 'sonner';

interface Service {
  id: string; userId: string; title: string; description: string | null;
  category: string; location: string | null; priceType: string | null;
  price: string | null; contactPhone: string | null; contactWhatsapp: string | null;
  imageUrls: string | null; status: string; createdAt: string; userName: string | null;
}

export default function ServiceDetail({ initialData }: { initialData?: Service | null }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isOwner } = useCurrentUser();
  const [item, setItem] = useState<Service | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    fetch(`/api/services/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Service } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  const deleteItem = async () => {
    if (!confirm('Delete this service?')) return;
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Failed to delete'); return; }
    toast.success('Service deleted');
    router.push('/services');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-500 mb-4">Service not found</p>
      <Link href="/services" className="text-sm text-gray-400 hover:text-gray-950">Back to Services</Link>
    </div>
  );

  const images = parseImageUrls(item.imageUrls).map(k => imageUrl(k)!);
  const owner = item && isOwner(item.userId);

  const formatPrice = () => {
    if (!item.price) return null;
    if (item.priceType === 'hourly') return `Rs. ${item.price}/hr`;
    if (item.priceType === 'free') return 'Free';
    if (item.priceType === 'negotiable') return `Rs. ${item.price} (negotiable)`;
    return `Rs. ${item.price}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/services" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>

        <div className={images.length > 0 ? 'grid lg:grid-cols-2 gap-6' : ''}>
          {images.length > 0 && <ImageGallery images={images} alt={item.title} />}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-700 rounded">{item.category}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{item.title}</h1>
              <div className="flex items-center gap-1 flex-shrink-0">
                <BookmarkButton targetType="service" targetId={item.id} />
                <ReportButton targetType="service" targetId={item.id} />
                {owner && <OwnerActions onDelete={deleteItem} />}
              </div>
            </div>
            {formatPrice() && (
              <p className="text-lg font-semibold text-gray-950">{formatPrice()}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
              {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" /> {item.location}</span>}
              <span className="text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              {item.userName && <span className="text-gray-400">by <Link href={`/user/${item.userId}`} className="hover:text-gray-950 transition-colors">{item.userName}</Link></span>}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2.5">
              <ContactLinks phone={item.contactPhone} whatsapp={item.contactWhatsapp} />
            </div>
            <ShareButtons url={`https://onnepal.com/services/${id}`} title={item.title} />
          </div>
        </div>

        {item.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        <CommentSection targetType="service" targetId={item.id} />
      </div>
    </div>
  );
}
