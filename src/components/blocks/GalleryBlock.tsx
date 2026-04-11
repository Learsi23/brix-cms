'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Represents child blocks (e.g. ImageBlock inside gallery)
 */
interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface GalleryBlockProps {
  data: BlockData;
  blocks?: RawChild[]; // ✅ renamed from children
}

export default function GalleryBlock({ data, blocks = [] }: GalleryBlockProps) {
  /**
   * 🔧 Dynamic configuration from CMS
   */
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize = getFieldValue(data, 'TitleSize', '1.5rem');
  const layoutType = getFieldValue(data, 'LayoutType', 'grid');
  const showArrows = getFieldValue(data, 'ShowArrows', 'true') === 'true';
  const itemHeight = getFieldValue(data, 'ItemHeight', '300px');
  const backgroundColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const padding = getFieldValue(data, 'Padding', '20px');
  const borderRadius = getFieldValue(data, 'BorderRadius', '0px');

  /**
   * 🧠 Extract images from child blocks
   */
  const images = blocks
    .filter(b => b.type === 'ImageBlock')
    .map(b => {
      const d = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        src: d.Source?.Value ?? '',
        alt: d.AltText?.Value ?? '',
      };
    })
    .filter(img => img.src);

  /**
   * Slider/carousel state
   */
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0 && !title) return null;

  return (
    <div style={{ backgroundColor, padding, borderRadius }}>
      {/* 🧾 Optional title */}
      {title && (
        <h2
          style={{ color: titleColor, fontSize: titleSize }}
          className="font-bold mb-4"
        >
          {title}
        </h2>
      )}

      {/* 🎞️ CAROUSEL / SLIDER */}
      {layoutType === 'carousel' || layoutType === 'slider' ? (
        <div className="relative overflow-hidden rounded-lg" style={{ height: itemHeight }}>
          {images.length > 0 && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeIdx].src}
                alt={images[activeIdx].alt}
                className="w-full h-full object-cover"
              />

              {/* Arrows */}
              {showArrows && images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() => setActiveIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full"
                  >
                    ›
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`w-2 h-2 rounded-full ${
                          i === activeIdx ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : layoutType === 'masonry' ? (
        /**
         * 🧱 Masonry layout
         */
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img.src}
              alt={img.alt}
              className="w-full rounded-lg break-inside-avoid"
            />
          ))}
        </div>
      ) : (
        /**
         * 🔲 Default grid
         */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img.src}
              alt={img.alt}
              className="w-full rounded-lg object-cover"
              style={{ height: itemHeight }}
            />
          ))}
        </div>
      )}
    </div>
  );
}