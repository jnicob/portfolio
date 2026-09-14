'use client';

import { useState, useCallback, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { BeyondCode } from '@/data/schemas';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

type BeyondCodeGalleryProps = {
  images: BeyondCode['images'];
  locale: Locale;
};

/**
 * BeyondCodeGallery:
 * Accessible photo carousel with interactive panning/drag gesture support (cursor-grab / cursor-grabbing),
 * hardware-accelerated smooth transitions, next/previous controls, pagination indicators, and dynamic localized captions.
 */
export function BeyondCodeGallery({ images, locale }: BeyondCodeGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startXRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Never start drag when clicking interactive buttons or indicators
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    setDragOffset(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported environments
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || startXRef.current === null) return;
    const deltaX = e.clientX - startXRef.current;
    if (!isDragging && Math.abs(deltaX) > 4) {
      setIsDragging(true);
    }
    setDragOffset(deltaX);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore unsupported environments
    }

    const currentOffset = dragOffset;
    setIsDragging(false);
    setDragOffset(0);
    startXRef.current = null;

    if (currentOffset < -40) {
      handleNext();
    } else if (currentOffset > 40) {
      handlePrev();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const activeImage = images[currentIndex];

  return (
    <Card
      role="region"
      aria-roledescription="carousel"
      aria-label={locale === 'es' ? 'Galería personal y viajes' : 'Personal and travel gallery'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="group relative overflow-hidden border-border bg-surface p-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring select-none"
    >
      {/* Slide viewport with drag panning gestures and hand cursors */}
      <div
        data-testid="gallery-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          'relative aspect-4/3 w-full overflow-hidden sm:aspect-16/11 touch-pan-y',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        <div
          className={cn(
            'flex h-full w-full select-none',
            isDragging
              ? 'transition-none pointer-events-none'
              : 'transition-transform duration-500 ease-out motion-reduce:transition-none',
          )}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {images.map((image, idx) => (
            <div
              key={image.src}
              className="relative h-full w-full shrink-0 grow-0"
              aria-hidden={idx !== currentIndex}
            >
              <Image
                src={image.src}
                alt={image.alt[locale]}
                width={800}
                height={600}
                unoptimized
                draggable={false}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover select-none pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Position counter badge (e.g., "1 / 6") */}
        <div className="pointer-events-none absolute top-3 right-3 rounded-badge bg-surface/85 px-2 py-0.5 text-xs font-mono font-medium text-fg shadow-xs backdrop-blur-xs border border-border/60">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Previous slide button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label={locale === 'es' ? 'Foto anterior' : 'Previous photo'}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full border border-border/80 bg-surface/85 p-2 text-fg shadow-xs backdrop-blur-xs transition-colors hover:bg-surface focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring active:scale-95 cursor-pointer z-20"
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Next slide button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label={locale === 'es' ? 'Foto siguiente' : 'Next photo'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-border/80 bg-surface/85 p-2 text-fg shadow-xs backdrop-blur-xs transition-colors hover:bg-surface focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring active:scale-95 cursor-pointer z-20"
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Pagination indicators (dots) */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-1 backdrop-blur-xs border border-border/50 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={locale === 'es' ? `Ir a la foto ${idx + 1}` : `Go to photo ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
                idx === currentIndex ? 'w-5 bg-accent' : 'w-2 bg-fg-muted/40 hover:bg-fg-muted/70',
              )}
            />
          ))}
        </div>
      </div>

      {/* Active photo dynamic caption */}
      {activeImage?.caption && (
        <CardContent className="border-t border-border/60 bg-surface/50 p-3 text-center text-xs font-medium text-fg-muted">
          {activeImage.caption[locale]}
        </CardContent>
      )}
    </Card>
  );
}
