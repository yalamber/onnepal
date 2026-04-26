'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  return `https://images.onnepal.com/${key}`;
}

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

export function ImageUpload({ value, onChange, max = 5, label = 'Upload images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error || 'Upload failed');
    }
    const data = await res.json() as { url: string };
    return data.url;
  };

  const handleFiles = async (files: FileList) => {
    const remaining = max - value.length;
    if (remaining <= 0) return;

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError('');

    try {
      const urls = await Promise.all(toUpload.map(upload));
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>

      {value.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {value.map((url, i) => (
            <div key={url} className="relative group">
              <img src={imageUrl(url) || url} alt="" className="w-20 h-20 rounded-md object-cover border border-gray-200" />
              {i === 0 && value.length > 1 && (
                <span className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-gray-950 text-white text-[9px] font-medium rounded">Main</span>
              )}
              <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button onClick={() => { const next = [...value]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; onChange(next); }}
                    className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center cursor-pointer">
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                )}
                {i < value.length - 1 && (
                  <button onClick={() => { const next = [...value]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; onChange(next); }}
                    className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center cursor-pointer">
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < max && (
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-gray-950 hover:border-gray-400 cursor-pointer transition-colors">
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-4 w-4" /> Choose {value.length > 0 ? 'more' : 'files'} ({value.length}/{max})</>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading} className="hidden" />
        </label>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-xs text-gray-300 mt-1">JPEG, PNG, WebP, GIF. Max 5MB each.</p>
    </div>
  );
}

interface SingleImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  target?: string;
  businessId?: string;
}

export function SingleImageUpload({ value, onChange, label = 'Upload image', target, businessId }: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (target) formData.append('target', target);
      if (businessId) formData.append('businessId', businessId);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json() as { url: string };
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {value ? (
        <div className="relative inline-block group">
          <img src={imageUrl(value) || value} alt="" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
          <button onClick={() => onChange(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-gray-950 hover:border-gray-400 cursor-pointer transition-colors">
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-4 w-4" /> Choose file</>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={uploading} className="hidden" />
        </label>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
