'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function CatalogItemBlock({ data }: { data: BlockData }) {
  const productId = getFieldValue(data, 'ProductId');
  const name = getFieldValue(data, 'Name');
  const sku = getFieldValue(data, 'Sku');
  const shortDesc = getFieldValue(data, 'ShortDescription');
  const image = getFieldValue(data, 'Image');
  const price = getFieldValue(data, 'Price');
  const originalPrice = getFieldValue(data, 'OriginalPrice');
  const currency = getFieldValue(data, 'CurrencySymbol', '€');
  const stock = getFieldValue(data, 'Stock');
  const showStock = getFieldValue(data, 'ShowStock', 'false') === 'true';
  const sizes = getFieldValue(data, 'Sizes')?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  const colors = getFieldValue(data, 'Colors')?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  const customOptions = getFieldValue(data, 'CustomOptions')?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  const badge = getFieldValue(data, 'Badge');
  const badgeColor = getFieldValue(data, 'BadgeColor', '#e53e3e');
  const showRating = getFieldValue(data, 'ShowRating', 'false') === 'true';
  const rating = parseFloat(getFieldValue(data, 'Rating', '5') || '5');
  const reviewCount = getFieldValue(data, 'ReviewCount');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#ffffff');
  const buttonText = getFieldValue(data, 'ButtonText', 'Add to cart');
  const hideButton = getFieldValue(data, 'HideButton', 'false') === 'true';

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  async function addToCart() {
    const id = productId;
    if (!id) return;
    setAdding(true);
    let sessionKey = localStorage.getItem('EdenCartSessionKey');
    if (!sessionKey) { sessionKey = 'eden_' + Date.now(); localStorage.setItem('EdenCartSessionKey', sessionKey); }
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, quantity: qty, sessionKey }),
      });
    } catch {}
    setAdding(false);
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? '★' : '☆');

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ backgroundColor: bgColor }}>
      {/* Image */}
      <div className="relative bg-slate-50">
        {badge && (
          <span className="absolute top-3 left-3 z-10 px-2 py-1 text-white text-xs font-bold rounded-full" style={{ backgroundColor: badgeColor }}>
            {badge}
          </span>
        )}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name || ''} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-4xl text-slate-200">📦</div>
        )}
      </div>

      <div className="p-5">
        {sku && <p className="text-xs text-slate-400 mb-1 font-mono">{sku}</p>}
        {name && <h3 className="text-lg font-bold text-slate-800 mb-2">{name}</h3>}
        {showRating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-amber-400 text-sm">{stars.join('')}</span>
            {reviewCount && <span className="text-xs text-slate-400">({reviewCount})</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {price && <span className="text-2xl font-black text-emerald-600">{currency}{price}</span>}
          {originalPrice && <span className="text-sm text-slate-400 line-through">{currency}{originalPrice}</span>}
        </div>

        {shortDesc && <p className="text-sm text-slate-500 mb-4">{shortDesc}</p>}

        {showStock && stock && (
          <p className="text-xs text-slate-400 mb-3">Stock: {stock}</p>
        )}

        {/* Variants */}
        {sizes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1 text-xs border rounded-lg transition ${selectedSize === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 hover:border-slate-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`px-3 py-1 text-xs border rounded-lg transition ${selectedColor === c ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 hover:border-slate-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {customOptions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">Options</p>
            <div className="flex flex-wrap gap-2">
              {customOptions.map(o => (
                <button key={o} onClick={() => setSelectedOption(o)}
                  className={`px-3 py-1 text-xs border rounded-lg transition ${selectedOption === o ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 hover:border-slate-400'}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {!hideButton && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold">−</button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold">+</button>
            </div>
            <button
              onClick={addToCart}
              disabled={adding || !productId}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {adding ? 'Adding...' : buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
