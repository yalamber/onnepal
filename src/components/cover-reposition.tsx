'use client';

import { useState, useRef, useCallback } from 'react';
import { Move, Check, X } from 'lucide-react';
import { imageUrl } from './image-upload';

interface CoverRepositionProps {
  imageKey: string;
  position: string;
  onSave: (position: string) => void;
}

export function CoverReposition({ imageKey, position, onSave }: CoverRepositionProps) {
  const [editing, setEditing] = useState(false);
  const [pos, setPos] = useState(position || '50 50');
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startPos = useRef(50);

  const src = imageUrl(imageKey);
  if (!src) return null;

  const yPercent = parseInt(pos.split(' ')[1] || '50');

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
      <div
        ref={containerRef}
        className={`w-full h-40 rounded-lg overflow-hidden ${editing ? 'cursor-grab ring-2 ring-gray-950' : ''} ${dragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <img
          src={src}
          alt="Cover"
          className="w-full h-full object-cover select-none"
          style={{ objectPosition: `${pos.split(' ')[0]}% ${pos.split(' ')[1]}%` }}
          draggable={false}
        />
        {editing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              <Move className="h-3 w-3" /> Drag to reposition
            </div>
          </div>
        )}
      </div>

      {editing ? (
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={save} className="p-1.5 bg-white rounded-md shadow-sm text-gray-950 hover:bg-gray-50 cursor-pointer">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={cancel} className="p-1.5 bg-white rounded-md shadow-sm text-gray-400 hover:text-gray-950 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-md shadow-sm text-gray-500 hover:text-gray-950 cursor-pointer text-xs flex items-center gap-1">
          <Move className="h-3 w-3" /> Reposition
        </button>
      )}
    </div>
  );
}
