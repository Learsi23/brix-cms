'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface FeatureListBlockProps {
  data: BlockData;
}

const PRESET_ITEMS = [
  { icon: 'fas fa-check-circle', title: 'Feature One', description: 'Description of the first feature' },
  { icon: 'fas fa-check-circle', title: 'Feature Two', description: 'Description of the second feature' },
  { icon: 'fas fa-check-circle', title: 'Feature Three', description: 'Description of the third feature' },
  { icon: 'fas fa-check-circle', title: 'Feature Four', description: 'Description of the fourth feature' },
];

export default function FeatureListBlock({ data }: FeatureListBlockProps) {
  const sectionId = getFieldValue(data, 'sectionId', '');
  const title = getFieldValue(data, 'title', '');
  const titleColor = getFieldValue(data, 'titleColor', '#000000');
  const titleAlign = getFieldValue(data, 'titleAlign', 'left') as 'left' | 'center' | 'right';
  const columns = getFieldValue(data, 'columns', '2');
  const gap = getFieldValue(data, 'gap', '1rem');
  const itemIconColor = getFieldValue(data, 'itemIconColor', '#10b981');
  const itemIconSize = getFieldValue(data, 'itemIconSize', '24px');
  const itemTitleColor = getFieldValue(data, 'itemTitleColor', '#000000');
  const itemTitleWeight = getFieldValue(data, 'itemTitleWeight', '600');
  const itemDescColor = getFieldValue(data, 'itemDescriptionColor', '#666666');
  const itemDescSize = getFieldValue(data, 'itemDescriptionSize', '14px');
  const bgColor = getFieldValue(data, 'backgroundColor', 'transparent');
  const paddingY = getFieldValue(data, 'paddingY', '2rem');

  const colClass = columns === '1' ? 'grid-cols-1'
    : columns === '3' ? 'grid-cols-1 sm:grid-cols-3'
    : columns === '4' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2';

  return (
    <section id={sectionId || undefined} style={{ backgroundColor: bgColor, padding: `${paddingY} 0` }}>
      <div className="max-w-5xl mx-auto px-6">
        {title && (
          <h2
            style={{ color: titleColor, textAlign: titleAlign }}
            className="text-2xl font-black mb-8"
          >
            {title}
          </h2>
        )}
        <div className={`grid ${colClass}`} style={{ gap }}>
          {PRESET_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <i
                className={item.icon}
                style={{ color: itemIconColor, fontSize: itemIconSize, marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <p style={{ color: itemTitleColor, fontWeight: itemTitleWeight }}>{item.title}</p>
                <p style={{ color: itemDescColor, fontSize: itemDescSize }} className="mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
