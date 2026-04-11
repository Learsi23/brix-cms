'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  pageType: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPageType, setNewPageType] = useState('standard');

  async function loadPages() {
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data);
    setLoading(false);
  }

  useEffect(() => { loadPages(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, slug, pageType: newPageType }),
    });
    setNewTitle('');
    setNewPageType('standard');
    loadPages();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page and all its blocks?')) return;
    await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    loadPages();
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    await fetch('/api/pages/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: id, direction }),
    });
    loadPages();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      Loading pages...
    </div>
  );

  const firstPublishedIdx = pages.findIndex(p => p.isPublished);

  return (
    <div className="container mx-auto mt-16 px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Your Pages</h2>
          <p className="text-xs text-gray-400 mt-1">
            The first published page is the home page (<code>/</code>)
          </p>
        </div>
        <form onSubmit={handleCreate} className="flex gap-2 items-center">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New page title..."
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-emerald-500"
            required
          />
          <select
            value={newPageType}
            onChange={e => setNewPageType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white cursor-pointer"
          >
            <option value="standard">📄 Standard</option>
            <option value="product">🛍️ Product</option>
          </select>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold transition"
          >
            + New Page
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              <th className="px-6 py-4 w-24">Order</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">URL</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  No pages yet.
                </td>
              </tr>
            ) : (
              pages.map((page, i) => (
                <tr key={page.id} className="hover:bg-gray-50 transition">
                  {/* Order */}
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {i > 0 && (
                        <button
                          onClick={() => handleMove(page.id, 'up')}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-xs"
                        >↑</button>
                      )}
                      {i < pages.length - 1 && (
                        <button
                          onClick={() => handleMove(page.id, 'down')}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-xs"
                        >↓</button>
                      )}
                    </div>
                  </td>

                  {/* Title + Home badge */}
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      {i === firstPublishedIdx && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          🏠 Home
                        </span>
                      )}
                      {page.title}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    {page.pageType === 'product' ? (
                      <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase px-2 py-1 rounded-full">🛍️ Product</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[9px] font-black uppercase px-2 py-1 rounded-full">📄 Standard</span>
                    )}
                  </td>

                  {/* URL */}
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">/{page.slug}</td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {page.isPublished ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">✅ Published</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full">📝 Draft</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      {page.isPublished && (
                        <a href={`/${page.slug}`} target="_blank" className="text-emerald-600 hover:underline text-sm">
                          🌐 View
                        </a>
                      )}
                      <Link href={`/admin/pages/${page.id}/edit`} className="text-blue-600 hover:underline text-sm">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
