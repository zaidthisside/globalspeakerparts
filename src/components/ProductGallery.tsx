'use client';

import { useState } from 'react';

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

  if (!images || images.length === 0) return null;

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-premium border border-[#EAEAEA] bg-[#F7F7F8]">
        <img
          src={activeImage.url}
          alt={activeImage.alt_text ?? productName}
          className="h-full w-full object-cover transition-opacity duration-300"
          key={activeImage.id}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                idx === activeIndex
                  ? 'border-[#0F0F10] shadow-sm'
                  : 'border-[#EAEAEA] hover:border-[#5C5C63]'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt_text ?? `${productName} - ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
