'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  pageType: string;
  parentId: string | null;
}

interface PageTreeNode extends PageItem {
  children: PageTreeNode[];
  depth: number;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPageType, setNewPageType] = useState('standard');
  const [newParentId, setNewParentId] = useState<string>('');
  const [subpageTitle, setSubpageTitle] = useState<Record<string, string>>({});

  const loadPages = useCallback(async () => {
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);

  function buildTree(allPages: PageItem[]): PageTreeNode[] {
    const map = new Map<string, PageTreeNode>();
    const roots: PageTreeNode[] = [];
    for (const p of allPages) {
      map.set(p.id, { ...p, children: [], depth: 0 });
    }
    for (const p of allPages) {
      const node = map.get(p.id)!;
      if (p.parentId && map.has(p.parentId)) {
        const parent = map.get(p.parentId)!;
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    const sortFn = (a: PageTreeNode, b: PageTreeNode) => a.sortOrder - b.sortOrder;
    for (const r of roots) r.children.sort(sortFn);
    roots.sort(sortFn);
    return roots;
  }

  function flattenTree(tree: PageTreeNode[]): PageTreeNode[] {
    const result: PageTreeNode[] = [];
    for (const node of tree) {
      result.push(node);
      if (node.children.length > 0) result.push(...flattenTree(node.children));
    }
    return result;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        slug,
        pageType: newPageType,
        parentId: newParentId || null,
      }),
    });
    setNewTitle('');
    setNewPageType('standard');
    setNewParentId('');
    loadPages();
  }

  async function handleCreateSubpage(parentId: string) {
    const title = subpageTitle[parentId];
    if (!title?.trim()) return;
    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, parentId }),
    });
    setSubpageTitle(prev => ({ ...prev, [parentId]: '' }));
    loadPages();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page and ALL its subpages?')) return;
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

  function getFullPathSlug(page: PageItem): string {
    const parts: string[] = [];
    let current: PageItem | undefined = page;
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      if (current.slug) parts.unshift(current.slug);
      current = current.parentId ? pages.find(p => p.id === current!.parentId) : undefined;
    }
    return '/' + parts.join('/');
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      Loading pages...
    </div>
  );

  const tree = buildTree(pages);
  const flatPages = flattenTree(tree);
  const firstPublished = flatPages.find(p => p.isPublished);

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
            value={newParentId}
            onChange={e => setNewParentId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white cursor-pointer"
          >
            <option value="">— Top level —</option>
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
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
            {flatPages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  No pages yet.
                </td>
              </tr>
            ) : (
              flatPages.map((page, i) => (
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
                      {i < flatPages.length - 1 && (
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
                      {page.depth > 0 && (
                        <span className="text-gray-300 select-none" style={{ paddingLeft: `${page.depth * 20}px` }}>
                          └─
                        </span>
                      )}
                      {page.id === firstPublished?.id && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          🏠 Home
                        </span>
                      )}
                      {page.title}
                    </div>
                    {/* Inline "+ Subpage" input */}
                    <div className="mt-1 flex items-center gap-1" style={{ paddingLeft: `${(page.depth + 1) * 20}px` }}>
                      <input
                        value={subpageTitle[page.id] ?? ''}
                        onChange={e => setSubpageTitle(prev => ({ ...prev, [page.id]: e.target.value }))}
                        placeholder="+ Subpage..."
                        className="w-28 px-2 py-0.5 text-xs border border-gray-200 rounded outline-none focus:border-emerald-400"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSubpage(page.id); } }}
                      />
                      {subpageTitle[page.id]?.trim() && (
                        <button
                          onClick={() => handleCreateSubpage(page.id)}
                          className="text-emerald-600 text-xs hover:underline"
                        >Add</button>
                      )}
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
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{getFullPathSlug(page)}</td>

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
                        <a href={getFullPathSlug(page)} target="_blank" className="text-emerald-600 hover:underline text-sm">
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
