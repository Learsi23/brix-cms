'use client';

// ====================================================================
// BLOCK EDITOR — EDEN CMS
// Identical design to Edit.cshtml from .NET
// - Sticky header with Preview, Back, Add Block
// - Sliding RIGHT side panel with category tabs and 2-column grid
// - Blocks with collapse/expand (localStorage)
// - "+" button between blocks to insert at position
// - Page background color in real time
// ====================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '@/lib/blocks';
import { getBlockDefinition, getBlocksByCategory, createDefaultData } from '@/lib/blocks';
import type { BlockData, BlockDefinition } from '@/lib/blocks/types';
import BlockForm from './BlockForm';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface EditorBlock {
  id: string;
  type: string;
  sortOrder: number;
  data: BlockData;
  parentId: string | null;
  children?: EditorBlock[];
}

interface BlockEditorProps {
  initialBlocks: Array<{
    id: string;
    type: string;
    sortOrder: number;
    jsonData: string | null;
    parentId: string | null;
  }>;
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  pageIsPublished?: boolean;
  pageJsonData?: string | null;
  pageDescription?: string | null;
  pageOgImage?: string | null;
  onPublished?: () => void;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function parseBlocks(raw: BlockEditorProps['initialBlocks']): EditorBlock[] {
  const roots = raw
    .filter(b => !b.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(b => ({
      id: b.id,
      type: b.type,
      sortOrder: b.sortOrder,
      data: b.jsonData ? (JSON.parse(b.jsonData) as BlockData) : {},
      parentId: null,
      children: raw
        .filter(c => c.parentId === b.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(c => ({
          id: c.id,
          type: c.type,
          sortOrder: c.sortOrder,
          data: c.jsonData ? (JSON.parse(c.jsonData) as BlockData) : {},
          parentId: b.id,
          children: [],
        })),
    }));
  return roots;
}

// ──────────────────────────────────────────────────────────────
// BlockItem — an individual block with collapse, move, delete
// ──────────────────────────────────────────────────────────────

function BlockItem({
  block,
  collapsed,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDataChange,
  onAddChild,
  onDeleteChild,
  onChildDataChange,
  onOpenSelectorForParent,
}: {
  block: EditorBlock;
  collapsed: boolean;
  onToggleCollapse: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onDataChange: (id: string, data: BlockData) => void;
  onAddChild: (parentId: string, type: string) => void;
  onDeleteChild: (parentId: string, childId: string) => void;
  onChildDataChange: (parentId: string, childId: string, data: BlockData) => void;
  onOpenSelectorForParent: (parentId: string) => void;
}) {
  const def = getBlockDefinition(block.type);
  const isGroup = def?.isGroup ?? false;

  return (
    <div className={`border rounded-3xl shadow-sm overflow-hidden ${isGroup ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200 bg-white'}`}>
      {/* Block header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg text-sm ${isGroup ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {def?.icon ?? '🟦'}
          </span>
          <div>
            <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{def?.name ?? block.type}</span>
            <span className="ml-2 text-[9px] text-gray-400 font-mono">{block.id.substring(0, 8)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Collapse */}
          <button
            onClick={() => onToggleCollapse(block.id)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs shadow-sm transition ${collapsed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▼' : '▲'}
          </button>
          {/* Move */}
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button onClick={() => onMoveUp(block.id)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-xs">↑</button>
            <button onClick={() => onMoveDown(block.id)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-xs">↓</button>
          </div>
          {/* Delete */}
          <button
            onClick={() => { if (confirm('Delete this block?')) onDelete(block.id); }}
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition shadow-sm border border-gray-200 text-sm"
          >
            ×
          </button>
        </div>
      </div>

      {/* Block content */}
      {!collapsed && (
        <div className="p-5">
          {def ? (
            <BlockForm
              definition={def}
              data={block.data}
              onChange={data => onDataChange(block.id, data)}
            />
          ) : (
            <p className="text-xs text-gray-400">Unknown block: {block.type}</p>
          )}

          {/* Child blocks for groups */}
          {isGroup && (
            <div className="mt-6 pl-6 border-l-2 border-purple-200 space-y-4">
              {(block.children ?? []).map(child => {
                const childDef = getBlockDefinition(child.type);
                return (
                  <div key={child.id} className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-purple-50 border-b border-purple-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{childDef?.icon ?? '🟦'}</span>
                        <span className="text-xs font-black uppercase text-purple-700">{childDef?.name ?? child.type}</span>
                      </div>
                      <button
                        onClick={() => { if (confirm('Delete?')) onDeleteChild(block.id, child.id); }}
                        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-4">
                      {childDef && (
                        <BlockForm
                          definition={childDef}
                          data={child.data}
                          onChange={data => onChildDataChange(block.id, child.id, data)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => onOpenSelectorForParent(block.id)}
                className="w-full py-4 border-2 border-dashed border-purple-200 text-purple-400 text-[10px] font-black uppercase rounded-2xl hover:bg-purple-50 transition"
              >
                + Add child block
              </button>
            </div>
          )}
        </div>
      )}
      {collapsed && (
        <div className="px-4 py-3 text-center text-gray-400 text-xs">
          Block collapsed — press ▲ to expand
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// BlockEditor — main component
// ──────────────────────────────────────────────────────────────

export default function BlockEditor({
  initialBlocks,
  pageId,
  pageTitle,
  pageSlug,
  pageIsPublished = false,
  pageJsonData,
  pageDescription,
  pageOgImage,
  onPublished,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseBlocks(initialBlocks));
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [title, setTitle] = useState(pageTitle);
  const [slug, setSlug] = useState(pageSlug);
  const [description, setDescription] = useState(pageDescription || '');
  const [ogImage, setOgImage] = useState(pageOgImage || '');
  const parsedPageData = pageJsonData ? JSON.parse(pageJsonData) : {};
  const [pageBgColor, setPageBgColor] = useState<string>(parsedPageData.BackgroundColor?.Value || '#f3f4f6');

  // Collapse blocks — localStorage
  const storageKey = `collapsed_${pageId}`;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  // Right side panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [insertBeforeId, setInsertBeforeId] = useState<string | null>(null); // null = at the end
  const [selectorParentId, setSelectorParentId] = useState<string | null>(null);

  const categorizedBlocks = getBlocksByCategory();
  const categories = Object.keys(categorizedBlocks).sort();

  // Fixed-position tooltip state (escapes overflow-y-auto clipping)
  const [hoveredBlock, setHoveredBlock] = useState<{ def: BlockDefinition; x: number; y: number } | null>(null);

  function openSelector(insertBefore: string | null = null, parentId: string | null = null) {
    setInsertBeforeId(insertBefore);
    setSelectorParentId(parentId);
    setPanelOpen(true);
    if (!activeTab && categories.length > 0) setActiveTab(categories[0]);
  }

  function addBlock(type: string) {
    const def = getBlockDefinition(type);
    if (!def) return;

    if (selectorParentId) {
      // Add as child of a group block
      const child: EditorBlock = {
        id: uuidv4(), type, sortOrder: 0, data: createDefaultData(def), parentId: selectorParentId,
      };
      setBlocks(prev => prev.map(b => {
        if (b.id !== selectorParentId) return b;
        const children = [...(b.children ?? []), { ...child, sortOrder: (b.children ?? []).length }];
        return { ...b, children };
      }));
    } else {
      const newBlock: EditorBlock = {
        id: uuidv4(), type, sortOrder: 0, data: createDefaultData(def), parentId: null,
        children: def.isGroup ? [] : undefined,
      };
      setBlocks(prev => {
        if (insertBeforeId === null) {
          const updated = [...prev, newBlock];
          return updated.map((b, i) => ({ ...b, sortOrder: i }));
        }
        const idx = prev.findIndex(b => b.id === insertBeforeId);
        const updated = [...prev.slice(0, idx), newBlock, ...prev.slice(idx)];
        return updated.map((b, i) => ({ ...b, sortOrder: i }));
      });
    }
    setPanelOpen(false);
  }

  function deleteBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id).map((b, i) => ({ ...b, sortOrder: i })));
  }

  function moveBlockUp(id: string) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((b, i) => ({ ...b, sortOrder: i }));
    });
  }

  function moveBlockDown(id: string) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next.map((b, i) => ({ ...b, sortOrder: i }));
    });
  }

  function updateBlockData(id: string, data: BlockData) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b));
  }

  function addChildBlock(parentId: string, type: string) {
    const def = getBlockDefinition(type);
    if (!def) return;
    const child: EditorBlock = { id: uuidv4(), type, sortOrder: 0, data: createDefaultData(def), parentId };
    setBlocks(prev => prev.map(b => {
      if (b.id !== parentId) return b;
      const children = [...(b.children ?? []), { ...child, sortOrder: (b.children ?? []).length }];
      return { ...b, children };
    }));
  }

  function deleteChildBlock(parentId: string, childId: string) {
    setBlocks(prev => prev.map(b => {
      if (b.id !== parentId) return b;
      return { ...b, children: (b.children ?? []).filter(c => c.id !== childId) };
    }));
  }

  function updateChildData(parentId: string, childId: string, data: BlockData) {
    setBlocks(prev => prev.map(b => {
      if (b.id !== parentId) return b;
      return { ...b, children: (b.children ?? []).map(c => c.id === childId ? { ...c, data } : c) };
    }));
  }

  // ── Flat block helpers ──

  function buildFlatBlocks() {
    return [
      ...blocks.map((b, i) => ({
        originalId: b.id, type: b.type,
        jsonData: JSON.stringify(b.data), sortOrder: i, parentId: null,
      })),
      ...blocks.flatMap(b =>
        (b.children ?? []).map((c, i) => ({
          originalId: c.id, type: c.type,
          jsonData: JSON.stringify(c.data), sortOrder: i, parentId: b.id,
        }))
      ),
    ];
  }

  // ── Save draft ──

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, description, ogImage,
          jsonData: JSON.stringify({ BackgroundColor: { Value: pageBgColor } }),
          blocks: buildFlatBlocks(),
          publish: false,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
      } else {
        alert('❌ Error saving: ' + result.error);
      }
    } catch {
      alert('❌ Network error while saving');
    } finally {
      setSaving(false);
    }
  }

  // ── Publish ──

  async function handlePublish() {
    setPublishing(true);
    try {
      const flatBlocks = buildFlatBlocks();
      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, description, ogImage,
          jsonData: JSON.stringify({ BackgroundColor: { Value: pageBgColor } }),
          blocks: flatBlocks,
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ Page published successfully');
        onPublished?.();
      } else {
        alert('❌ Error publishing: ' + result.error);
      }
    } catch {
      alert('❌ Network error while publishing');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div style={{ backgroundColor: pageBgColor, minHeight: '100vh', width: '100%', transition: 'background-color 0.3s ease' }}>
      <div className="max-w-5xl mx-auto p-10">

        {/* ── STICKY HEADER (same as .NET) ── */}
        <div className="sticky top-0 z-40 bg-white/40 backdrop-blur-md py-4 mb-8 border-b border-gray-200/50 flex justify-between items-center px-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{pageTitle}</h2>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Edit Mode Active</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {pageIsPublished ? (
              <>
                <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">✅ Published</span>
                <a href={`/${pageSlug}`} target="_blank" className="bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-sm">
                  🌐 View public
                </a>
              </>
            ) : (
              <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">📝 Draft</span>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold transition text-sm shadow-sm"
            >
              {saving ? '⏳ Saving...' : savedMsg ? '✅ Saved' : '💾 Save'}
            </button>

            <a
              href={`/admin/pages/${pageId}/preview`}
              onClick={async (e) => { if (!savedMsg) { e.preventDefault(); await handleSave(); } }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold transition text-sm shadow-sm"
            >
              🔍 Preview
            </a>

            <a href="/admin" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition text-sm shadow-sm">
              Back
            </a>

            <button
              onClick={() => openSelector(null, null)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold transition text-sm shadow-sm"
            >
              + Add Block
            </button>
          </div>
        </div>

        {/* ── SEO SETTINGS ── */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-search text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">SEO Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Meta Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description for search engines..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-[10px] text-gray-400 mt-1">{description.length}/160 recommended</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Open Graph Image (OG Image)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ogImage}
                  onChange={e => setOgImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const width = 900;
                    const height = 600;
                    const left = (window.innerWidth - width) / 2;
                    const top = (window.innerHeight - height) / 2;
                    const win = window.open('/admin/media', 'media', `width=${width},height=${height},left=${left},top=${top}`);
                    const checkInterval = setInterval(() => {
                      if (win?.closed) {
                        clearInterval(checkInterval);
                        navigator.clipboard.readText().then(text => {
                          if (text.startsWith('/uploads/') || text.startsWith('http')) {
                            setOgImage(text);
                          }
                        }).catch(() => {});
                      }
                    }, 500);
                  }}
                  className="px-3 py-2 bg-indigo-500 text-white rounded-xl text-sm hover:bg-indigo-600 transition"
                  title="Open Media Library"
                >
                  <i className="fas fa-images" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {ogImage && (
                  <>
                    <img src={ogImage} alt="OG Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    <button type="button" onClick={() => setOgImage('')} className="text-xs text-red-500 hover:text-red-700">
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE SETTINGS ── */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
          <div className="flex gap-3 items-center">
            {pageIsPublished ? (
              <>
                <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">✅ Published</span>
                <a href={`/${pageSlug}`} target="_blank" className="bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-sm">
                  🌐 View public
                </a>
              </>
            ) : (
              <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">📝 Draft</span>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold transition text-sm shadow-sm"
            >
              {saving ? '⏳ Saving...' : savedMsg ? '✅ Saved' : '💾 Save'}
            </button>

            <a
              href={`/admin/pages/${pageId}/preview`}
              onClick={async (e) => { if (!savedMsg) { e.preventDefault(); await handleSave(); } }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold transition text-sm shadow-sm"
            >
              🔍 Preview
            </a>

            <a href="/admin" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition text-sm shadow-sm">
              Back
            </a>

            <button
              onClick={() => openSelector(null, null)}
              className="bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition text-sm"
            >
              + Add Block
            </button>
          </div>
        </div>

        {/* ── BACKGROUND COLOR (same as .NET) ── */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 mb-8 shadow-lg shadow-gray-100/50 flex items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-700 tracking-tight">Background color</h3>
              <p className="text-[11px] text-gray-400">Customize the tone of this page</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={pageBgColor}
              onChange={e => setPageBgColor(e.target.value)}
              className="h-10 w-10 rounded-xl border-2 border-gray-200 shadow-inner cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={pageBgColor}
              onChange={e => setPageBgColor(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-white"
            />
          </div>
        </div>

        {/* ── BLOCK LIST ── */}
        <div className="space-y-4">
          {blocks.length === 0 ? (
            <div className="border-4 border-dashed border-gray-200 rounded-[2.5rem] p-24 text-center bg-white/50">
              <button onClick={() => openSelector(null)} className="group flex flex-col items-center mx-auto focus:outline-none">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                  <i className="fas fa-plus text-2xl text-emerald-500 group-hover:text-white" />
                </div>
                <p className="text-gray-400 font-bold text-xl mb-2">The page is empty</p>
                <span className="text-emerald-500 font-black uppercase text-xs tracking-[0.2em]">Click to get started</span>
              </button>
            </div>
          ) : (
            <>
              {blocks.map((block, idx) => (
                <div key={block.id} className="group relative">
                  {/* "+" button to insert BEFORE this block */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-30">
                    <button
                      onClick={() => openSelector(block.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition"
                    >
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </div>
                  <div className="mt-6 mb-8">
                    <BlockItem
                      block={block}
                      collapsed={collapsed[block.id] === true}
                      onToggleCollapse={toggleCollapse}
                      onMoveUp={moveBlockUp}
                      onMoveDown={moveBlockDown}
                      onDelete={deleteBlock}
                      onDataChange={updateBlockData}
                      onAddChild={addChildBlock}
                      onDeleteChild={deleteChildBlock}
                      onChildDataChange={updateChildData}
                      onOpenSelectorForParent={id => openSelector(null, id)}
                    />
                  </div>
                </div>
              ))}

              {/* Button at the end */}
              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={() => openSelector(null)}
                  className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <span className="text-xl font-bold">+</span>
                  <span className="font-black uppercase text-xs tracking-widest">Add block at end</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── PUBLISH BUTTON at the footer ── */}
        <div className="mt-10 pt-6 border-t border-gray-200/50">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 disabled:opacity-50 transition text-sm uppercase tracking-wider shadow-lg shadow-emerald-200"
          >
            {publishing ? '⏳ Publishing...' : '🚀 Publish page'}
          </button>
        </div>

      </div>

      {/* ── TOOLTIP FIXED (escapes overflow-y-auto clipping) ── */}
      {hoveredBlock?.def.description && (
        <div
          className="fixed pointer-events-none z-[99999] w-56 bg-gray-900 text-white rounded-2xl p-3 shadow-2xl transition-opacity duration-100"
          style={{
            left: `${hoveredBlock.x}px`,
            top: `${hoveredBlock.y - 12}px`,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
          <p className="font-bold text-emerald-400 text-[11px] mb-1 flex items-center gap-1.5">
            <span>{hoveredBlock.def.icon}</span>
            {hoveredBlock.def.name}
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed">{hoveredBlock.def.description}</p>
          {hoveredBlock.def.isGroup && (
            <p className="mt-2 text-[10px] text-purple-400 font-semibold">📦 Container — accepts child blocks</p>
          )}
        </div>
      )}

      {/* ── RIGHT SIDE PANEL BLOCK SELECTOR ── */}
      {panelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setPanelOpen(false)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
            {/* Panel header */}
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter">Block Library</h3>
              <button onClick={() => setPanelOpen(false)} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
            </div>

            {/* Category tabs */}
            <div className="flex bg-white border-b px-4 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-4 border-b-2 font-black text-[10px] uppercase tracking-widest transition whitespace-nowrap ${activeTab === cat ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 2-column grid of blocks */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                {(categorizedBlocks[activeTab] ?? []).map(def => (
                  <div
                    key={def.type}
                    onMouseEnter={(e) => {
                      if (def.description) {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setHoveredBlock({ def, x: rect.left + rect.width / 2, y: rect.top });
                      }
                    }}
                    onMouseLeave={() => setHoveredBlock(null)}
                  >
                    <button
                      type="button"
                      onClick={() => addBlock(def.type)}
                      className="w-full bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 transition-all flex flex-col items-center shadow-sm group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition text-2xl">
                        {def.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase text-gray-600 text-center">{def.name}</span>
                      {def.isGroup && (
                        <span className="mt-1 text-[9px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">Group</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
