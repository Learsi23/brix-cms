'use client';

import { useState, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category?: string | null;
}

interface ExistingProductsBlockProps {
  data: BlockData;
}

export default function ExistingProductsBlock({ data }: ExistingProductsBlockProps) {
  const title = getFieldValue(data, 'Title', '');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle', '');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#ffffff');
  const cardBg = getFieldValue(data, 'CardBgColor', '#ffffff');
  const paddingY = getFieldValue(data, 'PaddingY', '3rem');
  const maxItems = parseInt(getFieldValue(data, 'MaxItemsToShow', '8') || '8', 10);
  const sortBy = getFieldValue(data, 'SortBy', 'newest');
  const displayStyle = getFieldValue(data, 'DisplayStyle', 'grid');
  const columns = parseInt(getFieldValue(data, 'Columns', '4') || '4', 10);
  const showPrice = getFieldValue(data, 'ShowPrice', 'true') === 'true';
  const showStock = getFieldValue(data, 'ShowStock', 'false') === 'true';
  const showBuyButton = getFieldValue(data, 'ShowBuyButton', 'true') === 'true';
  const buttonText = getFieldValue(data, 'ButtonText', 'Add to cart');
  const filterCategory = getFieldValue(data, 'FilterCategory', '');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => {
        let list: Product[] = data.products || data || [];

        // Filter by category
        if (filterCategory) {
          list = list.filter(p =>
            (p.category ?? '').toLowerCase() === filterCategory.toLowerCase()
          );
        }

        // Sort
        if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
        else if (sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));

        setProducts(list.slice(0, maxItems));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [maxItems, sortBy, filterCategory]);

  async function addToCart(productId: string) {
    setAddingId(productId);
    let sessionKey = localStorage.getItem('EdenCartSessionKey');
    if (!sessionKey) { sessionKey = 'eden_' + Date.now(); localStorage.setItem('EdenCartSessionKey', sessionKey); }
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1, sessionKey }),
      });
    } catch {}
    setAddingId(null);
  }

  const colClass =
    columns <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
    columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  function ProductCard({ product }: { product: Product }) {
    return (
      <div
        className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col"
        style={{ backgroundColor: cardBg }}
      >
        <div className="h-48 bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">📦</div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{product.description}</p>
          )}
          <div className="mt-auto space-y-2">
            {showPrice && (
              <div className="text-lg font-black text-emerald-600">€{product.price.toFixed(2)}</div>
            )}
            {showStock && (
              <div className="text-xs text-gray-400">Stock: {product.stock}</div>
            )}
            {showBuyButton && (
              <button
                onClick={() => addToCart(product.id)}
                disabled={addingId === product.id}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {addingId === product.id ? 'Adding…' : buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section style={{ backgroundColor: bgColor, paddingTop: paddingY, paddingBottom: paddingY }}>
      <div className="max-w-6xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="mb-10">
            {title && (
              <h2 style={{ color: titleColor }} className="text-3xl font-black mb-2">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-500 text-lg">{subtitle}</p>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fas fa-spinner fa-spin text-2xl" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No products found{filterCategory ? ` in category "${filterCategory}"` : ''}.
          </div>
        ) : displayStyle === 'list' ? (
          <div className="space-y-4">
            {products.map(p => (
              <div
                key={p.id}
                className="flex gap-4 rounded-2xl border border-gray-100 p-4 shadow-sm"
                style={{ backgroundColor: cardBg }}
              >
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                  {p.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800">{p.name}</h3>
                  {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {showPrice && <div className="font-black text-emerald-600">€{p.price.toFixed(2)}</div>}
                  {showBuyButton && (
                    <button
                      onClick={() => addToCart(p.id)}
                      disabled={addingId === p.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                      {addingId === p.id ? '…' : buttonText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : displayStyle === 'carousel' ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
              >
                {products.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-full px-2 max-w-xs">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
            {products.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button onClick={() => setCarouselIdx(i => Math.max(0, i - 1))}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                  <i className="fas fa-chevron-left text-sm" />
                </button>
                <div className="flex gap-2">
                  {products.map((_, i) => (
                    <button key={i} onClick={() => setCarouselIdx(i)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ backgroundColor: i === carouselIdx ? '#6b7280' : '#d1d5db' }} />
                  ))}
                </div>
                <button onClick={() => setCarouselIdx(i => Math.min(products.length - 1, i + 1))}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                  <i className="fas fa-chevron-right text-sm" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Grid (default) */
          <div className={`grid ${colClass} gap-6`}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}
