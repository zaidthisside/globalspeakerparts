'use client';

import { useState, useRef } from 'react';
import { Package } from 'lucide-react';

interface ProductCardGalleryProps {
  product: {
    name: string;
    featured_image?: string | null;
    product_images?: Array<{ url: string }> | null;
  };
}

export default function ProductCardGallery({ product }: ProductCardGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mediaUrls = [
    ...(product.featured_image ? [{ url: product.featured_image }] : []),
    ...(product.product_images || []).map((img) => ({ url: img.url })),
  ].filter((item, index, self) => self.findIndex((t) => t.url === item.url) === index);

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
      setActiveIdx(index);
    }
  };

  if (mediaUrls.length === 0) {
    return (
      <div className="relative w-full aspect-square rounded-lg border border-black bg-white flex items-center justify-center overflow-hidden p-2">
        <Package className="h-12 w-12 text-[#EAEAEA]" />
      </div>
    );
  }

  if (mediaUrls.length === 1) {
    const item = mediaUrls[0];
    return (
      <div className="relative w-full aspect-square rounded-lg border border-black bg-white flex items-center justify-center overflow-hidden p-2">
        {isVideoUrl(item.url) ? (
          <video
            src={item.url}
            className="max-h-full max-w-full object-contain"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.url}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-lg border border-black bg-white overflow-hidden group/gallery">
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
      >
        {mediaUrls.map((item, idx) => (
          <div
            key={idx}
            className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center p-2 bg-white"
          >
            {isVideoUrl(item.url) ? (
              <video
                src={item.url}
                className="max-h-full max-w-full object-contain"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.url}
                alt={`${product.name} - media ${idx + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows (visible on hover) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
          }
        }}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 border border-black/25 flex items-center justify-center shadow-xs md:opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10 text-[11px] font-bold text-black select-none hover:bg-white cursor-pointer"
      >
        &lt;
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
          }
        }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 border border-black/25 flex items-center justify-center shadow-xs md:opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10 text-[11px] font-bold text-black select-none hover:bg-white cursor-pointer"
      >
        &gt;
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
        {mediaUrls.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              idx === activeIdx ? 'bg-[#0f0f10] w-3.5' : 'bg-[#0f0f10]/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
