'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export function ImageGallery({ images, alt = 'Image' }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => {
    setSelected((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setSelected((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!lightbox) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      <div>
        <button
          onClick={() => setLightbox(true)}
          className="block w-full overflow-hidden rounded-lg focus:outline-none"
        >
          <img
            src={images[selected]}
            alt={`${alt} ${selected + 1}`}
            className="aspect-[4/3] w-full object-cover"
          />
        </button>

        {images.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`shrink-0 overflow-hidden rounded-md ${
                  i === selected ? 'ring-2 ring-gray-950' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={src}
                  alt={`${alt} thumbnail ${i + 1}`}
                  className="h-16 w-16 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(false);
            }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {selected + 1} / {images.length}
          </div>

          <div
            className="relative flex max-h-[80vh] max-w-[90vw] items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute -left-12 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <img
              src={images[selected]}
              alt={`${alt} ${selected + 1}`}
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />

            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute -right-12 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div
              className="mt-4 flex gap-2 overflow-x-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`shrink-0 overflow-hidden rounded-md ${
                    i === selected ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={src}
                    alt={`${alt} thumbnail ${i + 1}`}
                    className="h-14 w-14 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
