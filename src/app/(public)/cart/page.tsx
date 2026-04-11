'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionKey, setSessionKey] = useState('');

  useEffect(() => {
    let key = localStorage.getItem('EdenCartSessionKey');
    if (!key) {
      key = 'eden_' + new Date().getTime();
      localStorage.setItem('EdenCartSessionKey', key);
    }
    setSessionKey(key);
    fetchCart(key);
  }, []);

  async function fetchCart(key: string) {
    try {
      const res = await fetch(`/api/cart?sessionKey=${encodeURIComponent(key)}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {}
    setLoading(false);
  }

  async function removeItem(cartItemId: string) {
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      setItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch {}
  }

  async function clearCart() {
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey }),
      });
      setItems([]);
    } catch {}
  }

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-800">🛒 Shopping Cart</h1>
          <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-500 font-semibold">
            ← Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-slate-500 mb-6">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {item.product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{item.product.name}</h3>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">${(item.product.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-600">Total:</span>
                <span className="text-2xl font-black text-emerald-600">${total.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Clear cart
                </button>
                <button
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors text-sm"
                >
                  Proceed to checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
