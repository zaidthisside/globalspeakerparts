'use client';

import { useState, useRef } from 'react';

type GalleryImage = {
  id: string;
  url: string;
  alt_text: string | null;
  order_index: number;
};

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isVideoUrl = (url: string) =>
    url.startsWith('data:video/') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg') ||
    url.includes('youtube.com') ||
    url.includes('vimeo.com');

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    const scrollLeft = scrollRef.current.scrollLeft;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    }
  };

  const scrollToImage = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image/Video Carousel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-premium border border-[#EAEAEA] bg-[#F7F7F8]">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
        >
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center bg-white p-2"
            >
              {isVideoUrl(img.url) ? (
                <video
                  src={img.url}
                  className="h-full w-full object-contain rounded-premium"
                  controls
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <img
                  src={img.url}
                  alt={img.alt_text ?? `${productName} - ${idx + 1}`}
                  className="h-full w-full object-contain rounded-premium"
                />
              )}
            </div>
          ))}
        </div>

        {/* Indicator dots for mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none sm:hidden">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  idx === activeIndex ? 'bg-[#0f0f10] w-3.5' : 'bg-[#0f0f10]/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              type="button"
              key={img.id}
              onClick={() => scrollToImage(idx)}
              className={`relative flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border-2 transition-all duration-200 bg-white ${
                idx === activeIndex
                  ? 'border-[#0f0f10] shadow-sm'
                  : 'border-[#EAEAEA] hover:border-[#5C5C63]'
              }`}
              aria-label={`View media ${idx + 1}`}
            >
              {isVideoUrl(img.url) ? (
                <div className="h-full w-full relative flex items-center justify-center bg-[#F7F7F8]">
                  <video src={img.url} className="h-full w-full object-cover" muted playsInline />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <img
                  src={img.url}
                  alt={img.alt_text ?? `${productName} - ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

