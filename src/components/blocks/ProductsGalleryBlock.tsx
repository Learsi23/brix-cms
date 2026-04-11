'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import { useState, useEffect } from 'react';
import ProductCardBlock from './ProductCardBlock';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface ProductFromApi {
  id: string;
}

interface ProductsGalleryBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function ProductsGalleryBlock({ data, blocks = [] }: ProductsGalleryBlockProps) {
  const title        = getFieldValue(data, 'Title');
  const titleColor   = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize    = getFieldValue(data, 'TitleSize', '2rem');
  const gap          = getFieldValue(data, 'Gap', '16px');
  const bgColor      = getFieldValue(data, 'BackgroundColor', 'transparent');
  const padding      = getFieldValue(data, 'Padding', '20px');
  const borderRadius = getFieldValue(data, 'BorderRadius', '0px');
  const categoryId   = getFieldValue(data, 'CategoryId');

  // Products auto-loaded from category
  const [categoryProducts, setCategoryProducts] = useState<ProductFromApi[]>([]);

  useEffect(() => {
    if (!categoryId) { setCategoryProducts([]); return; }
    fetch(`/api/product?categoryId=${encodeURIComponent(categoryId)}`)
      .then(r => r.ok ? r.json() : [])
      .then((list: ProductFromApi[]) => setCategoryProducts(list))
      .catch(() => setCategoryProducts([]));
  }, [categoryId]);

  // Child blocks (manual ProductCardBlock children)
  const childBlocks = blocks
    .filter(b => b.type === 'ProductCardBlock')
    .map(b => ({
      id: b.id,
      data: (b.jsonData ? JSON.parse(b.jsonData) : {}) as BlockData,
    }));

  // Decide what to render: category auto-load takes priority over manual children
  const renderFromCategory = categoryId && categoryProducts.length > 0;

  if (!renderFromCategory && childBlocks.length === 0 && !title) return null;

  return (
    <div style={{ backgroundColor: bgColor, padding, borderRadius }}>
      {title && (
        <h2 style={{ color: titleColor, fontSize: titleSize }} className="font-bold mb-6">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap }}>
        {renderFromCategory
          ? categoryProducts.map(p => (
              <ProductCardBlock
                key={p.id}
                data={{ ProductId: { Value: p.id }, ButtonText: { Value: 'Add to cart' } } as BlockData}
              />
            ))
          : childBlocks.map(cb => (
              <ProductCardBlock key={cb.id} data={cb.data} />
            ))
        }
      </div>
    </div>
  );
}
