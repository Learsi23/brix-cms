'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface MenuItem {
  customText: string;
  customUrl: string;
  isCustomUrl: boolean;
  pageSlug: string;
}

interface SocialMedia {
  platform: string;
  url: string;
  iconClass: string;
}

interface NavbarSettings {
  backgroundColor: string;
  textColor: string;
  logo: string;
  logoAltText: string;
  logoWidth: string;
  logoLink: string;
  isSticky: boolean;
  hasShadow: boolean;
  paddingVertical: string;
  menuItems: MenuItem[];
}

interface FooterSettings {
  backgroundColor: string;
  textColor: string;
  logo: string;
  logoAltText: string;
  logoWidth: string;
  logoPosition: string;
  showPagesColumn: boolean;
  pagesColumnTitle: string;
  pages: MenuItem[];
  showSocialMediaColumn: boolean;
  socialMediaColumnTitle: string;
  socialMedia: SocialMedia[];
  showCopyrightRow: boolean;
  companyName: string;
  companyNumber: string;
  copyrightText: string;
  showHorizontalLine: boolean;
  paddingVertical: string;
  columnsGap: string;
}

interface SiteSettings {
  navbar: NavbarSettings;
  footer: FooterSettings;
}

interface PageItem {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  parentId: string | null;
}

interface PageTreeNode extends PageItem {
  children: PageTreeNode[];
  depth: number;
}

const defaultSettings: SiteSettings = {
  navbar: {
    backgroundColor: '#ffffff', textColor: '#000000', logo: '', logoAltText: 'Logo',
    logoWidth: '150px', logoLink: '/', isSticky: true, hasShadow: true,
    paddingVertical: 'py-3', menuItems: [],
  },
  footer: {
    backgroundColor: '#1a1a1a', textColor: '#ffffff', logo: '', logoAltText: 'Logo',
    logoWidth: '150px', logoPosition: 'left', showPagesColumn: true, pagesColumnTitle: 'Pages',
    pages: [], showSocialMediaColumn: true, socialMediaColumnTitle: 'Follow Us', socialMedia: [],
    showCopyrightRow: true, companyName: '', companyNumber: '', copyrightText: 'All rights reserved',
    showHorizontalLine: true, paddingVertical: 'py-6', columnsGap: 'gap-8',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'navbar' | 'footer' | 'pages'>('navbar');
  const [success, setSuccess] = useState(false);

  // Pages state
  const [pages, setPages] = useState<PageItem[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newParentId, setNewParentId] = useState<string>('');

  useEffect(() => {
    fetch('/api/config?key=site').then(async res => {
      if (res.ok) {
        const data = await res.json();
        if (data.value) setSettings({ ...defaultSettings, ...data.value });
      }
    });
  }, []);

  const loadPages = useCallback(async () => {
    setPagesLoading(true);
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data);
    setPagesLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'pages') loadPages();
  }, [tab, loadPages]);

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

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, slug, parentId: newParentId || null }),
    });
    setNewTitle('');
    setNewParentId('');
    loadPages();
  }

  async function handleDeletePage(id: string) {
    if (!confirm('Delete this page and ALL its subpages?')) return;
    await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    loadPages();
  }

  async function handleMovePage(id: string, direction: 'up' | 'down') {
    await fetch('/api/pages/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: id, direction }),
    });
    loadPages();
  }

  function updateNavbar(field: string, value: string | boolean) {
    setSettings(prev => ({ ...prev, navbar: { ...prev.navbar, [field]: value } }));
  }

  function updateFooter(field: string, value: string | boolean) {
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  }

  function addMenuItem() {
    setSettings(prev => ({
      ...prev,
      navbar: { ...prev.navbar, menuItems: [...prev.navbar.menuItems, { customText: '', customUrl: '', isCustomUrl: true, pageSlug: '' }] },
    }));
  }

  function removeMenuItem(idx: number) {
    setSettings(prev => ({
      ...prev,
      navbar: { ...prev.navbar, menuItems: prev.navbar.menuItems.filter((_, i) => i !== idx) },
    }));
  }

  function updateMenuItem(idx: number, field: string, value: string | boolean) {
    setSettings(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        menuItems: prev.navbar.menuItems.map((item, i) => i === idx ? { ...item, [field]: value } : item),
      },
    }));
  }

  function addSocialMedia() {
    setSettings(prev => ({
      ...prev,
      footer: { ...prev.footer, socialMedia: [...prev.footer.socialMedia, { platform: '', url: '', iconClass: '' }] },
    }));
  }

  function removeSocialMedia(idx: number) {
    setSettings(prev => ({
      ...prev,
      footer: { ...prev.footer, socialMedia: prev.footer.socialMedia.filter((_, i) => i !== idx) },
    }));
  }

  function updateSocialMedia(idx: number, field: string, value: string) {
    setSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialMedia: prev.footer.socialMedia.map((item, i) => i === idx ? { ...item, [field]: value } : item),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'site', value: settings }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500';
  const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-800">Site Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Navbar and Footer</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTab('navbar')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'navbar' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          🎨 Navbar
        </button>
        <button onClick={() => setTab('footer')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'footer' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          🦶 Footer
        </button>
        <button onClick={() => setTab('pages')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'pages' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          📄 Pages
        </button>
      </div>

      {/* NAVBAR */}
      {tab === 'navbar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Background Color</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.navbar.backgroundColor} onChange={e => updateNavbar('backgroundColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.navbar.backgroundColor} onChange={e => updateNavbar('backgroundColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Text Color</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.navbar.textColor} onChange={e => updateNavbar('textColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.navbar.textColor} onChange={e => updateNavbar('textColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Logo URL</label>
                <input value={settings.navbar.logo} onChange={e => updateNavbar('logo', e.target.value)} placeholder="/uploads/logo.png" className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Logo Width</label>
                <input value={settings.navbar.logoWidth} onChange={e => updateNavbar('logoWidth', e.target.value)} placeholder="150px" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Logo Link</label>
                <input value={settings.navbar.logoLink} onChange={e => updateNavbar('logoLink', e.target.value)} placeholder="/" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Vertical Padding (Tailwind)</label>
                <input value={settings.navbar.paddingVertical} onChange={e => updateNavbar('paddingVertical', e.target.value)} placeholder="py-3" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.navbar.isSticky} onChange={e => updateNavbar('isSticky', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Sticky (fixed on scroll)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.navbar.hasShadow} onChange={e => updateNavbar('hasShadow', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Shadow</span>
              </label>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Menu Items</h3>
              <button onClick={addMenuItem} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">+ Add</button>
            </div>
            {settings.navbar.menuItems.length === 0 && <p className="text-sm text-slate-400">No menu items.</p>}
            {settings.navbar.menuItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <label className={labelCls}>Text</label>
                  <input value={item.customText} onChange={e => updateMenuItem(i, 'customText', e.target.value)} placeholder="Home" className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>URL</label>
                  <input value={item.customUrl} onChange={e => updateMenuItem(i, 'customUrl', e.target.value)} placeholder="/" className={inputCls} />
                </div>
                <button onClick={() => removeMenuItem(i)} className="px-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGES */}
      {tab === 'pages' && (
        <div className="space-y-6">
          {/* Create page */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Create Page</h3>
            <form onSubmit={handleCreatePage} className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Title</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Page title..." required className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="w-44">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Parent</label>
                <select value={newParentId} onChange={e => setNewParentId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="">— Top-level —</option>
                  {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition">+ Create</button>
            </form>
          </div>

          {/* Pages table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {pagesLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No pages yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left w-20">Order</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">URL</th>
                    <th className="px-4 py-3 text-left w-24">Status</th>
                    <th className="px-4 py-3 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const tree = buildTree(pages);
                    const flat = flattenTree(tree);
                    const firstPub = flat.find(p => p.isPublished);
                    return flat.map((page, i) => (
                      <tr key={page.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {i > 0 && <button onClick={() => handleMovePage(page.id, 'up')} className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs">↑</button>}
                            {i < flat.length - 1 && <button onClick={() => handleMovePage(page.id, 'down')} className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs">↓</button>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            {page.depth > 0 && <span className="text-slate-300 text-xs select-none" style={{ paddingLeft: `${page.depth * 16}px` }}>└─</span>}
                            {page.id === firstPub?.id && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Home</span>}
                            {page.title}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs hidden md:table-cell">{getFullPathSlug(page)}</td>
                        <td className="px-4 py-3">
                          {page.isPublished ? (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">Published</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">Draft</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/pages/${page.id}/edit`} className="text-blue-600 hover:underline text-xs font-semibold">Edit</Link>
                            <button onClick={() => handleDeletePage(page.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      {tab === 'footer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Background Color</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.footer.backgroundColor} onChange={e => updateFooter('backgroundColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.footer.backgroundColor} onChange={e => updateFooter('backgroundColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Text Color</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.footer.textColor} onChange={e => updateFooter('textColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.footer.textColor} onChange={e => updateFooter('textColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Logo URL</label>
                <input value={settings.footer.logo} onChange={e => updateFooter('logo', e.target.value)} placeholder="/uploads/logo.png" className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Logo Width</label>
                <input value={settings.footer.logoWidth} onChange={e => updateFooter('logoWidth', e.target.value)} placeholder="150px" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Company Name</label>
                <input value={settings.footer.companyName} onChange={e => updateFooter('companyName', e.target.value)} placeholder="My Company" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Copyright Text</label>
                <input value={settings.footer.copyrightText} onChange={e => updateFooter('copyrightText', e.target.value)} placeholder="All rights reserved" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showSocialMediaColumn} onChange={e => updateFooter('showSocialMediaColumn', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Show social media</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showCopyrightRow} onChange={e => updateFooter('showCopyrightRow', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Show copyright</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showHorizontalLine} onChange={e => updateFooter('showHorizontalLine', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Show horizontal line</span>
              </label>
            </div>
          </div>

          {/* Footer Pages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showPagesColumn} onChange={e => updateFooter('showPagesColumn', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm font-bold text-slate-700">Show pages column</span>
              </label>
            </div>
            <div>
              <label className={labelCls}>Column Title</label>
              <input value={settings.footer.pagesColumnTitle} onChange={e => updateFooter('pagesColumnTitle', e.target.value)} placeholder="Pages" className={`${inputCls} max-w-xs`} />
            </div>
            {settings.footer.pages.map((item, i) => (
              <div key={i} className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <label className={labelCls}>Label</label>
                  <input value={item.customText} onChange={e => {
                    const newPages = [...settings.footer.pages];
                    newPages[i] = { ...newPages[i], customText: e.target.value };
                    setSettings(prev => ({ ...prev, footer: { ...prev.footer, pages: newPages } }));
                  }} placeholder="About" className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>URL</label>
                  <input value={item.customUrl} onChange={e => {
                    const newPages = [...settings.footer.pages];
                    newPages[i] = { ...newPages[i], customUrl: e.target.value };
                    setSettings(prev => ({ ...prev, footer: { ...prev.footer, pages: newPages } }));
                  }} placeholder="/about" className={inputCls} />
                </div>
                <button onClick={() => {
                  setSettings(prev => ({ ...prev, footer: { ...prev.footer, pages: prev.footer.pages.filter((_, j) => j !== i) } }));
                }} className="px-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => {
              setSettings(prev => ({ ...prev, footer: { ...prev.footer, pages: [...prev.footer.pages, { customText: '', customUrl: '', isCustomUrl: true, pageSlug: '' }] } }));
            }} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">+ Add Page Link</button>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Social Media</h3>
              <button onClick={addSocialMedia} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">+ Add</button>
            </div>
            {settings.footer.socialMedia.length === 0 && <p className="text-sm text-slate-400">No social media.</p>}
            {settings.footer.socialMedia.map((sm, i) => (
              <div key={i} className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <label className={labelCls}>Platform</label>
                  <input value={sm.platform} onChange={e => updateSocialMedia(i, 'platform', e.target.value)} placeholder="facebook" className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>URL</label>
                  <input value={sm.url} onChange={e => updateSocialMedia(i, 'url', e.target.value)} placeholder="https://facebook.com/..." className={inputCls} />
                </div>
                <button onClick={() => removeSocialMedia(i)} className="px-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-200">
        <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 disabled:opacity-50 text-sm uppercase tracking-wider shadow-lg shadow-emerald-200 transition-colors">
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
        {success && <p className="mt-3 text-center text-sm text-emerald-600 font-semibold">✅ Settings saved successfully</p>}
      </div>
    </div>
  );
}