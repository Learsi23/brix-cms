'use client';

import { useState, useRef, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface ProductsGalleryBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function ProductsGalleryBlock({ data, blocks }: ProductsGalleryBlockProps) {
  const title = getFieldValue(data, 'title', '');
  const titleColor = getFieldValue(data, 'titleColor', '#111827');
  const bgColor = getFieldValue(data, 'backgroundColor', 'transparent');
  const paddingY = getFieldValue(data, 'paddingY', '3rem');
  const cardsPerView = parseInt(getFieldValue(data, 'cardsPerView', '3') || '3');
  const gap = parseInt(getFieldValue(data, 'gap', '24') || '24');
  const showArrows = getFieldValue(data, 'showArrows', 'true') === 'true';
  const showDots = getFieldValue(data, 'showDots', 'true') === 'true';
  const autoPlay = getFieldValue(data, 'autoPlay', 'false') === 'true';
  const autoPlayInterval = parseInt(getFieldValue(data, 'autoPlayInterval', '3000') || '3000');

  const items = blocks ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxIdx = Math.max(0, items.length - cardsPerView);

  useEffect(() => {
    if (!autoPlay || items.length <= cardsPerView) return;
    timerRef.current = setInterval(() => {
      setCurrentIdx(i => i >= maxIdx ? 0 : i + 1);
    }, autoPlayInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, autoPlayInterval, maxIdx, items.length, cardsPerView]);

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No products — add <strong>ProductCard</strong> blocks inside.
      </div>
    );
  }

  function renderCard(block: RawChild) {
    const d: BlockData = block.jsonData ? JSON.parse(block.jsonData) : {};
    const name = getFieldValue(d, 'name', '') || getFieldValue(d, 'title', '');
    const price = getFieldValue(d, 'price', '0');
    const image = getFieldValue(d, 'image', '');
    const description = getFieldValue(d, 'description', '');
    const badge = getFieldValue(d, 'badge', '');
    const accentColor = getFieldValue(d, 'accentColor', '#10b981');
    const buttonText = getFieldValue(d, 'buttonText', 'Add to Cart');
    const buttonColor = getFieldValue(d, 'buttonColor', '#10b981');

    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
        {image
          ? <img src={image} alt={name} className="w-full h-48 object-cover" />
          : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <i className="fas fa-box text-gray-300 text-3xl" />
            </div>
          )}
        <div className="p-4 flex-1 flex flex-col gap-2">
          {badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full self-start" style={{ backgroundColor: accentColor, color: '#fff' }}>
              {badge}
            </span>
          )}
          {name && <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>}
          {description && <p className="text-xs text-gray-500 line-clamp-2">{description}</p>}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="font-bold text-base" style={{ color: accentColor }}>${parseFloat(price || '0').toFixed(2)}</span>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: buttonColor }}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cardWidth = `calc(${100 / cardsPerView}% - ${gap * (cardsPerView - 1) / cardsPerView}px)`;

  return (
    <section style={{ backgroundColor: bgColor, padding: `${paddingY} 0` }}>
      <div className="max-w-6xl mx-auto px-6">
        {title && (
          <h2 className="text-3xl font-black mb-8 text-center" style={{ color: titleColor }}>{title}</h2>
        )}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{
                gap: `${gap}px`,
                transform: `translateX(calc(-${currentIdx} * (${100 / cardsPerView}% + ${gap / cardsPerView}px)))`,
              }}
            >
              {items.map(block => (
                <div key={block.id} style={{ minWidth: cardWidth, flexShrink: 0 }}>
                  {renderCard(block)}
                </div>
              ))}
            </div>
          </div>

          {showArrows && items.length > cardsPerView && (
            <>
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 z-10"
              >
                <i className="fas fa-chevron-left text-gray-600 text-sm" />
              </button>
              <button
                onClick={() => setCurrentIdx(i => Math.min(maxIdx, i + 1))}
                disabled={currentIdx >= maxIdx}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 z-10"
              >
                <i className="fas fa-chevron-right text-gray-600 text-sm" />
              </button>
            </>
          )}
        </div>

        {showDots && items.length > cardsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className="rounded-full transition-all"
                style={{
                  height: '0.5rem',
                  width: currentIdx === i ? '1.5rem' : '0.5rem',
                  backgroundColor: currentIdx === i ? '#6366f1' : '#d1d5db',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
