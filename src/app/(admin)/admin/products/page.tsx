'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  stripePriceId: string | null;
  category: string | null;
  sku: string | null;
  badge: string | null;
  originalPrice: number | null;
}

interface Category {
  name: string;
  count: number;
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    imageUrl: '',
    category: '',
    sku: '',
    badge: '',
    stripePriceId: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const url = activeCategory ? `/api/product?categorySlug=${encodeURIComponent(activeCategory)}` : '/api/product';
      const res = await fetch(url);
      if (res.ok) setProducts(await res.json());
    } catch {}
    setLoadingProducts(false);
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/product');
      if (res.ok) {
        const all: Product[] = await res.json();
        const cats = all
          .filter(p => p.category)
          .map(p => p.category!)
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .sort();
        setCategories(cats.map(c => ({ name: c, count: all.filter(p => p.category === c).length })));
      }
    } catch {}
  }

  function openCreate() {
    setIsEdit(false);
    setForm({ id: '', name: '', description: '', price: '', originalPrice: '', stock: '', imageUrl: '', category: '', sku: '', badge: '', stripePriceId: '' });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setIsEdit(true);
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price.toString(),
      originalPrice: p.originalPrice?.toString() || '',
      stock: p.stock.toString(),
      imageUrl: p.imageUrl || '',
      category: p.category || '',
      sku: p.sku || '',
      badge: p.badge || '',
      stripePriceId: p.stripePriceId || '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...form, id: form.id } : form;
      const res = await fetch('/api/product', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMsg(isEdit ? '✅ Updated.' : '✅ Product created.');
        setTimeout(() => setMsg(''), 3000);
        setShowModal(false);
        fetchProducts();
        fetchCategories();
      } else {
        const err = await res.json();
        setMsg('❌ ' + (err.error || 'Error'));
      }
    } catch { setMsg('❌ Error'); }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete product '${name}'? This cannot be undone.`)) return;
    console.log('Deleting product:', id, name);
    const res = await fetch(`/api/product?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    console.log('Delete result:', res.status, result);
    if (res.ok) {
      setMsg('✅ Product deleted');
      setTimeout(() => setMsg(''), 3000);
      fetchProducts();
      fetchCategories();
    } else {
      setMsg('❌ ' + (result.error || 'Error deleting product'));
    }
  }

  const filteredProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  return (
    <div className="p-8 max-w-7xl mx-auto"
      data-asset-ids='{ "showModal": "boolean", "isEdit": "boolean", "form": "object" }'
      x-data={`{ 
        showModal: false, 
        isEdit: false, 
        form: ${JSON.stringify(form).replace(/"/g, "'")},
        openCreate() { 
          this.isEdit = false; 
          this.form = { id: '', name: '', description: '', price: '', originalPrice: '', stock: '', imageUrl: '', category: '', sku: '', badge: '', stripePriceId: '' }; 
          this.showModal = true; 
        },
        openEdit(p) { 
          this.isEdit = true; 
          this.form = { 
            id: p.id, name: p.name, description: p.description||'', price: p.price.toString(), originalPrice: p.originalPrice?.toString()||'', stock: p.stock.toString(), imageUrl: p.imageUrl||'', category: p.category||'', sku: p.sku||'', badge: p.badge||'', stripePriceId: p.stripePriceId||'' 
          }; 
          this.showModal = true; 
        }
      }`}>

      {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">{msg}</div>}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 rounded-2xl px-8 py-6 mb-8 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">🛍️ Products</h1>
          <p className="text-violet-300 text-sm mt-1">Manage your product catalog</p>
        </div>
        <button onClick={openCreate} className="bg-white text-violet-900 px-5 py-2.5 rounded-xl text-sm font-black shadow hover:bg-violet-50 transition flex items-center gap-2">
          + New Product
        </button>
      </div>

      {/* LAYOUT: SIDEBAR + TABLE */}
      <div className="flex gap-6 items-start">
        {/* Category sidebar */}
        {categories.length > 0 && (
          <aside className="w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <span className="text-violet-500 text-xs">📁</span>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</p>
              </div>
              <nav className="p-2 space-y-0.5">
                <button onClick={() => router.push('/admin/products')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${!activeCategory ? 'bg-violet-50 text-violet-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="flex items-center gap-2">📊 All</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{products.length}</span>
                </button>
                {categories.map(cat => (
                  <button key={cat.name} onClick={() => router.push(`/admin/products?category=${encodeURIComponent(cat.name)}`)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${activeCategory === cat.name ? 'bg-violet-50 text-violet-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="flex items-center gap-2">📁 {cat.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* PRODUCTS TABLE */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loadingProducts ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-bold text-gray-500">No products yet</p>
              <p className="text-sm mt-1">Click <strong>+ New Product</strong> to add your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-14">Image</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-lg">🛍️</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-gray-800">{p.name}</p>
                        {p.badge && <span className="inline-block bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">{p.badge}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-gray-800">{p.price.toFixed(2)}</span>
                        {p.originalPrice && <span className="text-xs text-gray-400 line-through ml-1">{p.originalPrice.toFixed(2)}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.stock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{p.category || '—'}</td>
                      <td className="px-5 py-3"><span className="font-mono text-xs text-gray-500">{p.sku || '—'}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(p.id, p.name)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-violet-900 to-indigo-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-black text-white">{isEdit ? '✏️ Edit Product' : '➕ New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white text-2xl leading-none transition">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Name <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Price</label>
                      <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Original Price</label>
                      <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Stock</label>
                    <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="/uploads/product.jpg" className={`${inputCls} font-mono`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Category</label>
                      <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} list="categories" className={inputCls} />
                      <datalist id="categories">
                        {categories.map(c => <option key={c.name} value={c.name} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className={labelCls}>SKU</label>
                      <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={`${inputCls} font-mono`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Badge</label>
                    <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Nuevo" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Stripe Price ID</label>
                    <input value={form.stripePriceId} onChange={e => setForm(f => ({ ...f, stripePriceId: e.target.value }))} placeholder="price_xxxxx (optional)" className={`${inputCls} font-mono`} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="bg-violet-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-violet-700 transition shadow disabled:opacity-50">
                    {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}