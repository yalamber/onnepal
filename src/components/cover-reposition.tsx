'use client';

import { useState, useRef, useCallback } from 'react';
import { Move, Check, X, Camera, Upload, Loader2 } from 'lucide-react';
import { imageUrl } from './image-upload';

interface CoverRepositionProps {
  imageKey: string | null;
  position: string;
  onSave: (position: string) => void;
  onUpload: (key: string) => void;
  onRemove: () => void;
  logoUrl: string | null;
  businessName: string;
  primaryColor: string;
  onLogoUpload: (key: string) => void;
  onLogoRemove: () => void;
  businessId: string;
}

export function CoverReposition({
  imageKey, position, onSave, onUpload, onRemove,
  logoUrl, businessName, primaryColor, onLogoUpload, onLogoRemove,
  businessId,
}: CoverRepositionProps) {
  const [editing, setEditing] = useState(false);
  const [pos, setPos] = useState(position || '50 50');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const startY = useRef(0);
  const startPos = useRef(50);

  const src = imageUrl(imageKey);
  const logoSrc = imageUrl(logoUrl);
  const yPercent = parseInt(pos.split(' ')[1] || '50');

  const uploadFile = async (file: File, target: string): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', target);
      fd.append('businessId', businessId);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) return null;
      const data = await res.json() as { url: string };
      return data.url;
    } catch { return null; }
  };

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    const key = await uploadFile(file, 'cover');
    if (key) onUpload(key);
    setUploading(false);
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const key = await uploadFile(file, 'logo');
    if (key) onLogoUpload(key);
    setUploadingLogo(false);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editing) return;
    e.preventDefault();
    setDragging(true);
    startY.current = e.clientY;
    startPos.current = yPercent;
  }, [editing, yPercent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = e.clientY - startY.current;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newY = Math.max(0, Math.min(100, startPos.current - deltaPercent));
    setPos(`50 ${Math.round(newY)}`);
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!editing) return;
    setDragging(true);
    startY.current = e.touches[0].clientY;
    startPos.current = yPercent;
  }, [editing, yPercent]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || !containerRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = e.touches[0].clientY - startY.current;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newY = Math.max(0, Math.min(100, startPos.current - deltaPercent));
    setPos(`50 ${Math.round(newY)}`);
  }, [dragging]);

  const save = () => {
    onSave(pos);
    setEditing(false);
  };

  const cancel = () => {
    setPos(position || '50 50');
    setEditing(false);
  };

  return (
    <div className="relative">
      {/* Cover image area */}
      <div
        ref={containerRef}
        className={`w-full h-48 sm:h-56 rounded-xl overflow-hidden relative ${
          editing ? 'cursor-grab ring-2 ring-gray-950' : ''
        } ${dragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {src ? (
          <img
            src={src}
            alt="Cover"
            className="w-full h-full object-cover select-none"
            style={{ objectPosition: `${pos.split(' ')[0]}% ${pos.split(' ')[1]}%` }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
            <p className="text-white/50 text-sm">No cover image</p>
          </div>
        )}

        {/* Drag overlay */}
        {editing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              <Move className="h-3 w-3" /> Drag to reposition
            </div>
          </div>
        )}

        {/* Cover action buttons */}
        {!editing && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {src && (
              <button onClick={() => { setEditing(true); setPos(position || '50 50'); }}
                className="px-2.5 py-1.5 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-sm">
                <Move className="h-3 w-3" /> Reposition
              </button>
            )}
            <label className="px-2.5 py-1.5 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-sm">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              {src ? 'Change' : 'Add cover'}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
            </label>
            {src && (
              <button onClick={onRemove}
                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg cursor-pointer transition-colors backdrop-blur-sm">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Reposition save/cancel buttons */}
        {editing && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={save}
              className="px-3 py-1.5 bg-white text-gray-950 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-gray-50">
              <Check className="h-3 w-3" /> Save
            </button>
            <button onClick={cancel}
              className="px-3 py-1.5 bg-white/90 text-gray-600 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-white">
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Logo overlapping bottom-left */}
      <div className="absolute -bottom-10 left-5 sm:left-6">
        <div className="relative group">
          {logoSrc ? (
            <img src={logoSrc} alt={businessName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-4 border-white shadow-sm bg-white" />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-4 border-white shadow-sm flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
              style={{ backgroundColor: primaryColor }}>
              {businessName.charAt(0)}
            </div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 rounded-xl cursor-pointer transition-colors group">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingLogo ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" disabled={uploadingLogo}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
          </label>
          {logoSrc && (
            <button onClick={onLogoRemove}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity shadow-sm">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
