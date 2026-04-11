'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  stripePriceId: string | null;
  category: { id: string; name: string; slug: string } | null;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/product?id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProduct(data?.error ? null : data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function addToCart() {
    if (!product) return;
    let sessionKey = localStorage.getItem('EdenCartSessionKey');
    if (!sessionKey) {
      sessionKey = 'eden_' + Date.now();
      localStorage.setItem('EdenCartSessionKey', sessionKey);
    }
    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: qty, sessionKey }),
      });
      if (res.ok) {
        const result = await res.json();
        const cartCount = document.getElementById('cart-count');
        if (cartCount && result.totalProducts !== undefined) {
          cartCount.innerText = result.totalProducts.toString();
        }
        router.push('/cart');
      } else {
        const d = await res.json();
        alert('❌ ' + (d.error || 'Error adding to cart'));
      }
    } catch {
      alert('❌ Network error');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-6xl mb-4">📦</p>
          <p className="text-slate-500 mb-4">Product not found</p>
          <Link href="/" className="text-emerald-600 hover:underline text-sm">← Back to home</Link>
        </div>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="capitalize">{product.category.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-slate-700 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Imagen */}
            <div className="bg-slate-50 flex items-center justify-center min-h-64">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover max-h-96"
                />
              ) : (
                <div className="text-6xl text-slate-200">📦</div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col">
              {product.category && (
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-3xl font-black text-slate-800 mb-3">{product.name}</h1>

              <p className="text-4xl font-black text-emerald-600 mb-4">${product.price.toFixed(2)}</p>

              {product.description && (
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{product.description}</p>
              )}

              <div className="flex items-center gap-2 mb-6">
                {outOfStock ? (
                  <span className="px-3 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-full border border-red-100">
                    Out of stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                    {product.stock} available
                  </span>
                )}
              </div>

              {/* Cantidad + botón */}
              {!outOfStock && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-800">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={adding}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-60 text-sm"
                  >
                    {adding ? '⏳ Adding...' : '🛒 Add to cart'}
                  </button>
                </div>
              )}

              <Link href="/cart" className="text-center text-xs text-slate-400 hover:text-emerald-600 transition-colors">
                View cart →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
