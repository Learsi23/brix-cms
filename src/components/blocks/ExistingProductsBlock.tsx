'use client';

import { useState, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  stock?: number;
  rating?: number;
  badge?: string;
}

interface ExistingProductsBlockProps {
  data: BlockData;
}

export default function ExistingProductsBlock({ data }: ExistingProductsBlockProps) {
  const title = getFieldValue(data, 'title', 'Our Products');
  const titleColor = getFieldValue(data, 'titleColor', '#111827');
  const subtitle = getFieldValue(data, 'subtitle', '');
  const subtitleColor = getFieldValue(data, 'subtitleColor', '#6b7280');
  const productIds = getFieldValue(data, 'productIds', '');
  const category = getFieldValue(data, 'category', '');
  const maxProducts = parseInt(getFieldValue(data, 'maxProducts', '12') || '12');
  const sortBy = getFieldValue(data, 'sortBy', 'name');
  const displayMode = getFieldValue(data, 'displayMode', 'grid') as 'grid' | 'list' | 'carousel';
  const columns = getFieldValue(data, 'columns', '3');
  const carouselCards = parseInt(getFieldValue(data, 'carouselCards', '3') || '3');
  const autoPlay = getFieldValue(data, 'autoPlay', 'false') === 'true';
  const bgColor = getFieldValue(data, 'backgroundColor', 'transparent');
  const paddingY = getFieldValue(data, 'paddingY', '3rem');
  const accentColor = getFieldValue(data, 'accentColor', '#10b981');
  const showAddToCart = getFieldValue(data, 'showAddToCart', 'true') === 'true';
  const cartButtonText = getFieldValue(data, 'cartButtonText', 'Add to Cart');
  const cartButtonColor = getFieldValue(data, 'cartButtonColor', '#10b981');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (productIds) params.set('ids', productIds);
        params.set('limit', String(maxProducts));
        const res = await fetch(`/api/product?${params}`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        let items: Product[] = Array.isArray(json) ? json : (json.products ?? json.items ?? []);

        if (sortBy === 'price-asc') items.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
        else if (sortBy === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'stock') items.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        else if (sortBy === 'rating') items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        setProducts(items.slice(0, maxProducts));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, productIds, maxProducts, sortBy]);

  useEffect(() => {
    if (!autoPlay || displayMode !== 'carousel' || products.length <= carouselCards) return;
    const maxIdx = products.length - carouselCards;
    const timer = setInterval(() => {
      setCarouselIdx(i => i >= maxIdx ? 0 : i + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoPlay, displayMode, products.length, carouselCards]);

  const colClasses: Record<string, string> = {
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  function ProductCard({ p }: { p: Product }) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
        {p.image
          ? <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
          : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <i className="fas fa-box text-gray-300 text-3xl" />
            </div>
          )}
        <div className="p-4 flex-1 flex flex-col gap-2">
          {p.badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full self-start" style={{ backgroundColor: accentColor, color: '#fff' }}>
              {p.badge}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
          {p.description && <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="font-bold text-base" style={{ color: accentColor }}>${p.price.toFixed(2)}</span>
            {showAddToCart && (
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: cartButtonColor }}>
                {cartButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <section style={{ backgroundColor: bgColor, padding: `${paddingY} 0` }}>
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm py-12">Loading products...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section style={{ backgroundColor: bgColor, padding: `${paddingY} 0` }}>
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm py-12">No products found.</div>
      </section>
    );
  }

  const maxCarouselIdx = Math.max(0, products.length - carouselCards);

  return (
    <section style={{ backgroundColor: bgColor, padding: `${paddingY} 0` }}>
      <div className="max-w-6xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && <h2 className="text-3xl font-black mb-2" style={{ color: titleColor }}>{title}</h2>}
            {subtitle && <p style={{ color: subtitleColor }}>{subtitle}</p>}
          </div>
        )}

        {displayMode === 'list' && (
          <div className="space-y-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex gap-4 p-4">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                  : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-box text-gray-300 text-xl" />
                    </div>
                  )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-bold" style={{ color: accentColor }}>${p.price.toFixed(2)}</span>
                    {showAddToCart && (
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: cartButtonColor }}>
                        {cartButtonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayMode === 'carousel' && (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300"
                style={{
                  gap: '1.5rem',
                  transform: `translateX(calc(-${carouselIdx} * (${100 / carouselCards}% + ${24 / carouselCards}px)))`,
                }}
              >
                {products.map(p => (
                  <div key={p.id} style={{ minWidth: `calc(${100 / carouselCards}% - ${24 * (carouselCards - 1) / carouselCards}px)` }}>
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            </div>
            {products.length > carouselCards && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCarouselIdx(i => Math.max(0, i - 1))}
                  disabled={carouselIdx === 0}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-30"
                >
                  <i className="fas fa-chevron-left text-xs" />
                </button>
                <button
                  onClick={() => setCarouselIdx(i => Math.min(maxCarouselIdx, i + 1))}
                  disabled={carouselIdx >= maxCarouselIdx}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-30"
                >
                  <i className="fas fa-chevron-right text-xs" />
                </button>
              </div>
            )}
          </div>
        )}

        {displayMode === 'grid' && (
          <div className={`grid ${colClasses[columns] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}
