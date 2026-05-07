import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface BrixGridDemoBlockProps {
  data: BlockData;
}

export default function BrixGridDemoBlock({ data }: BrixGridDemoBlockProps) {
  const title = getFieldValue(data, 'title', 'Block System');
  const titleColor = getFieldValue(data, 'titleColor', '#ffffff');
  const titleSize = getFieldValue(data, 'titleSize', '2rem');
  const subtitle = getFieldValue(data, 'subtitle', 'Modular. Flexible. Powerful.');
  const subtitleColor = getFieldValue(data, 'subtitleColor', '#9ca3af');

  const blocks = [
    { label: 'Hero', w: 'col-span-2', h: 'row-span-2', color: '#6366f1' },
    { label: 'Text', w: 'col-span-1', h: 'row-span-1', color: '#8b5cf6' },
    { label: 'Image', w: 'col-span-1', h: 'row-span-1', color: '#a78bfa' },
    { label: 'Stats', w: 'col-span-1', h: 'row-span-1', color: '#7c3aed' },
    { label: 'CTA', w: 'col-span-2', h: 'row-span-1', color: '#4f46e5' },
    { label: 'Gallery', w: 'col-span-1', h: 'row-span-2', color: '#6d28d9' },
    { label: 'Card', w: 'col-span-1', h: 'row-span-1', color: '#5b21b6' },
    { label: 'Video', w: 'col-span-1', h: 'row-span-1', color: '#4338ca' },
  ];

  return (
    <section className="py-16 px-6 bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          {title && (
            <h2 style={{ color: titleColor, fontSize: titleSize }} className="font-black mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ color: subtitleColor }}>{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3" style={{ gridAutoRows: '80px' }}>
          {blocks.map((b, i) => (
            <div
              key={i}
              className={`${b.w} ${b.h} rounded-xl flex items-center justify-center text-white text-xs font-bold opacity-80 hover:opacity-100 transition-opacity`}
              style={{ backgroundColor: b.color }}
            >
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
