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
      setError(err instanceof Error ? err.message : 'Upload error');
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

  async function deleteFolder(name: string) {
    if (!confirm(`Delete folder "${name}"? Only if empty`)) return;
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteFolder', folder: currentFolder, name }),
    });
    if (res.ok) loadMedia();
    else {
      const d = await res.json();
      setError(d.error);
    }
  }

  async function deleteFile(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteFile', folder: currentFolder, name }),
    });
    if (res.ok) loadMedia();
  }

  function copyUrl(path: string) {
    navigator.clipboard.writeText(path);
    alert('✅ URL copied to clipboard: ' + path);
  }

  function selectImage(path: string) {
    navigator.clipboard.writeText(path);
    window.opener?.postMessage({ type: 'selectImage', url: path }, '*');
    alert('✅ Image selected. Return to editor and paste (Ctrl+V)');
    window.close();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-800">Media Library</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          /uploads/{currentFolder}
        </p>
      </header>

      {/* Breadcrumbs */}
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

      {/* Dropzone */}
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
            {uploading ? 'Uploading...' : 'Drag images or click to upload'}
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

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowNewFolder(true)}
          className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          📁 New Folder
        </button>
        <div className="text-xs text-slate-400">
          {files.length} file{files.length !== 1 ? 's' : ''} · {folders.length} folder{folders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* New Folder Modal */}
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

      {/* Folders Grid */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {folders.map(folder => {
              const fullPath = currentFolder ? `${currentFolder}/${folder}` : folder;
              return (
                <div key={folder} className="group relative">
                  <button
                    onClick={() => navigateToFolder(fullPath)}
                    className="w-full block bg-white border border-slate-200 rounded-xl p-3 text-center hover:border-emerald-500 hover:shadow-md transition-all"
                  >
                    <div className="text-3xl mb-1">📁</div>
                    <div className="text-xs truncate font-medium text-slate-700">{folder}</div>
                  </button>
                  <button
                    onClick={() => deleteFolder(folder)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete folder"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Grid */}
      {files.length > 0 ? (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Files</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {files.map(file => (
              <div key={file.filename} className="group relative">
                <div 
                  onClick={() => file.type === 'image' && selectImage(file.path)}
                  className={`bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-500 hover:shadow-md transition-all ${file.type === 'image' ? 'cursor-pointer' : ''}`}
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
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file.path)}
                    className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-emerald-50"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => deleteFile(file.filename)}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
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