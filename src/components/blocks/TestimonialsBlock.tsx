'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface TestimonialsBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function TestimonialsBlock({ data, blocks }: TestimonialsBlockProps) {
  const title = getFieldValue(data, 'Title', '');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle', '');
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const cardBg = getFieldValue(data, 'CardBgColor', '#ffffff');
  const starColor = getFieldValue(data, 'StarColor', '#f59e0b');
  const autoPlay = getFieldValue(data, 'AutoPlay', 'true') === 'true';
  const autoPlayInterval = parseInt(getFieldValue(data, 'AutoPlayInterval', '4000') || '4000', 10);

  const items = (blocks ?? [])
    .filter(b => b.type === 'TestimonialItemBlock')
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        reviewText: getFieldValue(d, 'ReviewText', ''),
        name: getFieldValue(d, 'Name', ''),
        role: getFieldValue(d, 'Role', ''),
        avatar: getFieldValue(d, 'Avatar', ''),
        stars: parseInt(getFieldValue(d, 'Stars', '5') || '5', 10),
      };
    });

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, next, items.length]);

  return (
    <section style={{ backgroundColor: bgColor, padding: '4rem 0' }}>
      <div className="max-w-4xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-500 text-lg max-w-xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No testimonials — add <strong>TestimonialItem</strong> blocks inside.
          </div>
        ) : (
          <>
            {/* Card */}
            <div
              className="rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-2xl mx-auto"
              style={{ backgroundColor: cardBg }}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={i < (items[current]?.stars ?? 5) ? 'fas fa-star' : 'far fa-star'}
                    style={{ color: starColor, fontSize: '1rem' }}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                &ldquo;{items[current]?.reviewText}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                {items[current]?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={items[current].avatar}
                    alt={items[current].name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-user text-gray-400" />
                  </div>
                )}
                <div className="text-left">
                  <div className="font-bold text-gray-800">{items[current]?.name}</div>
                  {items[current]?.role && (
                    <div className="text-sm text-gray-500">{items[current].role}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            {items.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <i className="fas fa-chevron-left text-sm" />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ backgroundColor: i === current ? '#6b7280' : '#d1d5db' }}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <i className="fas fa-chevron-right text-sm" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
