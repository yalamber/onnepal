'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';

interface GalleryImage {
  id: string;
  imageKey: string;
  caption: string | null;
}

export default function GalleryPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/gallery?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { images?: GalleryImage[] } = await res.json();
      setImages(data.images || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchImages(); }, [business]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json() as { url: string };
      setUploadedKey(data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImage = async () => {
    if (!uploadedKey || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/gallery?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageKey: uploadedKey, caption: caption || null }),
      });
      if (res.ok) {
        setCaption('');
        setUploadedKey('');
        setShowForm(false);
        await fetchImages();
      }
    } finally { setAdding(false); }
  };

  const deleteImage = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/gallery/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setImages(images.filter((img) => img.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500 mt-0.5">Showcase photos of your business</p>
        </div>
        {!showForm && images.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add photo
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Add a photo</p>
            <button onClick={() => { setShowForm(false); setUploadedKey(''); setCaption(''); setUploadError(''); }} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Image upload */}
          {uploadedKey ? (
            <div className="relative inline-block group">
              <img src={imageUrl(uploadedKey) || uploadedKey} alt="" className="w-32 h-32 rounded-lg object-cover border border-gray-200" />
              <button onClick={() => setUploadedKey('')}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-gray-950 hover:border-gray-400 cursor-pointer transition-colors w-fit">
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4" /> Choose image</>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={uploading} className="hidden" />
            </label>
          )}
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Caption <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe this photo" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setUploadedKey(''); setCaption(''); }} className="cursor-pointer">Cancel</Button>
            <Button onClick={addImage} disabled={adding || !uploadedKey} size="sm" className="bg-gray-950 text-white hover:bg-gray-800 cursor-pointer">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add photo'}
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      {images.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No photos yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload photos to showcase your business</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add your first photo
          </Button>
        </div>
      ) : images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl border border-gray-200 bg-white overflow-hidden">
              <img
                src={imageUrl(img.imageKey) || ''}
                alt={img.caption || ''}
                className="w-full aspect-square object-cover"
              />
              {img.caption && (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 truncate">{img.caption}</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteImage(img.id)}
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
