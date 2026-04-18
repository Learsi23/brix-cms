'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface MediaFile {
  filename: string;
  path: string;
  size: number;
  type: string;
}

interface Breadcrumb {
  name: string;
  path: string;
}

interface DeleteTarget {
  type: 'file' | 'folder';
  name: string;
}

export default function MediaPage() {
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Delete modal (single item)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteForce, setDeleteForce] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForce, setBatchForce] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  const loadMedia = useCallback(async (folder: string = currentFolder) => {
    const res = await fetch(`/api/media?folder=${encodeURIComponent(folder)}`);
    if (res.ok) {
      const data = await res.json();
      setFolders(data.folders);
      setFiles(data.files);
      setCurrentFolder(data.currentFolder);
      setBreadcrumbs(data.breadcrumbs);
    }
  }, [currentFolder]);

  useEffect(() => { loadMedia(''); }, []);

  function navigateToFolder(folder: string) {
    loadMedia(folder);
    setError(null);
    setSelectMode(false);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    } else {
      file = e.target.files?.[0] || null;
    }
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', currentFolder);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      loadMedia();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createFolder', folder: currentFolder, name: newFolderName }),
    });
    if (res.ok) {
      setNewFolderName('');
      setShowNewFolder(false);
      loadMedia();
    } else {
      const d = await res.json();
      setError(d.error);
    }
  }

  // ── Single delete ─────────────────────────────────────────────────────────

  function openDeleteModal(type: 'file' | 'folder', name: string) {
    setDeleteTarget({ type, name });
    setDeleteForce(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const action = deleteTarget.type === 'file' ? 'deleteFile' : 'deleteFolder';
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, folder: currentFolder, name: deleteTarget.name, force: deleteForce }),
    });
    setDeleting(false);
    if (res.ok) {
      setDeleteTarget(null);
      loadMedia();
    } else {
      const d = await res.json();
      setError(d.error);
      setDeleteTarget(null);
    }
  }

  // ── Multi-select ──────────────────────────────────────────────────────────

  function toggleSelectFile(name: string) {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleSelectFolder(name: string) {
    setSelectedFolders(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function selectAll() {
    setSelectedFiles(new Set(files.map(f => f.filename)));
    setSelectedFolders(new Set(folders));
  }

  function clearSelection() {
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
  }

  const totalSelected = selectedFiles.size + selectedFolders.size;

  async function confirmBatchDelete() {
    setBatchDeleting(true);
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteMultiple',
        folder: currentFolder,
        files: [...selectedFiles],
        folders: [...selectedFolders],
        force: batchForce,
      }),
    });
    setBatchDeleting(false);
    setShowBatchModal(false);
    setBatchForce(false);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
    }
    loadMedia();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function copyUrl(p: string) {
    navigator.clipboard.writeText(p);
  }

  function selectImage(p: string) {
    navigator.clipboard.writeText(p);
    window.opener?.postMessage({ type: 'selectImage', url: p }, '*');
    window.close();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* ── Single Delete Modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Red header */}
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <span className="text-2xl">{deleteTarget.type === 'folder' ? '📁' : '🖼️'}</span>
              <div>
                <p className="text-white font-black text-base leading-tight">
                  Delete {deleteTarget.type === 'folder' ? 'folder' : 'file'}?
                </p>
                <p className="text-red-200 text-xs mt-0.5 font-mono truncate max-w-[260px]">
                  {deleteTarget.name}
                </p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {deleteTarget.type === 'folder' && (
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteForce}
                    onChange={e => setDeleteForce(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span className="text-sm text-slate-700">
                    <span className="font-bold text-red-600">Force delete</span> — remove folder and all its contents
                  </span>
                </label>
              )}
              {deleteTarget.type === 'folder' && !deleteForce && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ Only empty folders can be deleted without force.
                </p>
              )}
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {deleting ? '⏳ Deleting…' : '🗑 Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Batch Delete Modal ──────────────────────────────────────────── */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <p className="text-white font-black text-base">Delete {totalSelected} item{totalSelected !== 1 ? 's' : ''}?</p>
              <p className="text-red-200 text-xs mt-0.5">This action cannot be undone</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {selectedFiles.size > 0 && (
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                    Files ({selectedFiles.size})
                  </p>
                  <ul className="space-y-0.5 max-h-28 overflow-y-auto">
                    {[...selectedFiles].map(f => (
                      <li key={f} className="text-xs font-mono text-slate-600 truncate">🖼️ {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedFolders.size > 0 && (
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                    Folders ({selectedFolders.size})
                  </p>
                  <ul className="space-y-0.5 max-h-28 overflow-y-auto">
                    {[...selectedFolders].map(f => (
                      <li key={f} className="text-xs font-mono text-slate-600 truncate">📁 {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedFolders.size > 0 && (
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={batchForce}
                    onChange={e => setBatchForce(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span className="text-sm text-slate-700">
                    <span className="font-bold text-red-600">Force delete</span> folders and all their contents
                  </span>
                </label>
              )}
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => { setShowBatchModal(false); setBatchForce(false); }}
                  disabled={batchDeleting}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBatchDelete}
                  disabled={batchDeleting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {batchDeleting ? '⏳ Deleting…' : `🗑 Delete ${totalSelected} item${totalSelected !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-800">Media Library</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">/uploads/{currentFolder}</p>
      </header>

      {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
        <button
          onClick={() => navigateToFolder('')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            !currentFolder
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          📁 Root
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-slate-400">/</span>
            <button
              onClick={() => navigateToFolder(crumb.path)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                i === breadcrumbs.length - 1
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              📁 {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* ── Dropzone ─────────────────────────────────────────────────────── */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e); }}
        className={`border-4 border-dashed rounded-2xl p-8 text-center mb-6 bg-white transition-all ${
          dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
        }`}
      >
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <span className="text-4xl">{uploading ? '⏳' : '📸'}</span>
          <span className="text-sm font-bold text-slate-600">
            {uploading ? 'Uploading…' : 'Drag images here or click to upload'}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <span className="text-xs text-slate-400">JPG, PNG, GIF, WEBP, SVG</span>
        </label>
        {error && <p className="mt-3 text-sm text-red-500 font-semibold">{error}</p>}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            📁 New Folder
          </button>
          <button
            onClick={() => {
              setSelectMode(prev => !prev);
              clearSelection();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border shadow-sm transition-colors ${
              selectMode
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            {selectMode ? '✓ Select mode ON' : '☐ Select'}
          </button>
          {selectMode && (
            <>
              <button onClick={selectAll} className="text-xs px-3 py-2 text-violet-600 hover:text-violet-800 font-bold rounded-lg hover:bg-violet-50 transition">
                All
              </button>
              {totalSelected > 0 && (
                <button onClick={clearSelection} className="text-xs px-3 py-2 text-slate-400 hover:text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition">
                  Clear
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectMode && totalSelected > 0 && (
            <button
              onClick={() => { setBatchForce(false); setShowBatchModal(true); }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-colors shadow-sm"
            >
              🗑 Delete selected ({totalSelected})
            </button>
          )}
          <div className="text-xs text-slate-400">
            {files.length} file{files.length !== 1 ? 's' : ''} · {folders.length} folder{folders.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── New Folder Modal ─────────────────────────────────────────────── */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-emerald-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && createFolder()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                className="px-6 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Folders grid ─────────────────────────────────────────────────── */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {folders.map(folder => {
              const fullPath = currentFolder ? `${currentFolder}/${folder}` : folder;
              const isSelected = selectedFolders.has(folder);
              return (
                <div key={folder} className="group relative">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelectFolder(folder)}
                      className={`absolute top-1 left-1 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-violet-500 bg-violet-500' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="text-white text-[9px] font-black">✓</span>}
                    </button>
                  )}
                  <button
                    onClick={() => selectMode ? toggleSelectFolder(folder) : navigateToFolder(fullPath)}
                    className={`w-full block bg-white border rounded-xl p-3 text-center transition-all ${
                      isSelected
                        ? 'border-violet-400 bg-violet-50 shadow-md'
                        : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-1">📁</div>
                    <div className="text-xs truncate font-medium text-slate-700">{folder}</div>
                  </button>
                  {!selectMode && (
                    <button
                      onClick={() => openDeleteModal('folder', folder)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete folder"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Files grid ───────────────────────────────────────────────────── */}
      {files.length > 0 ? (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Files</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {files.map(file => {
              const isSelected = selectedFiles.has(file.filename);
              return (
                <div key={file.filename} className="group relative">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelectFile(file.filename)}
                      className={`absolute top-1 left-1 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-violet-500 bg-violet-500' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="text-white text-[9px] font-black">✓</span>}
                    </button>
                  )}
                  <div
                    onClick={() => selectMode ? toggleSelectFile(file.filename) : (file.type === 'image' && selectImage(file.path))}
                    className={`bg-white border rounded-xl p-3 transition-all ${
                      isSelected
                        ? 'border-violet-400 bg-violet-50 shadow-md'
                        : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
                    } ${(file.type === 'image' || selectMode) ? 'cursor-pointer' : ''}`}
                  >
                    {file.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.path} alt={file.filename} className="h-20 w-full object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="h-20 w-full flex items-center justify-center bg-slate-50 rounded-lg mb-2 text-3xl">
                        📄
                      </div>
                    )}
                    <div className="text-[10px] truncate font-mono text-slate-500">{file.filename}</div>
                    <div className="text-[10px] text-slate-400">{formatSize(file.size)}</div>
                  </div>
                  {/* Hover overlay — only in normal mode */}
                  {!selectMode && (
                    <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyUrl(file.path)}
                        className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-emerald-50"
                        title="Copy URL"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => openDeleteModal('file', file.filename)}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : folders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-4">📪</div>
          <p className="text-slate-400">This folder is empty</p>
          <p className="text-xs text-slate-300 mt-2">Upload images or create folders to organize</p>
        </div>
      )}
    </div>
  );
}
