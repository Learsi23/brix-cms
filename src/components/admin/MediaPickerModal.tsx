'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface Props {
  onSelect: (path: string) => void;
  onClose: () => void;
}

export default function MediaPickerModal({ onSelect, onClose }: Props) {
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadMedia = useCallback(async (folder: string) => {
    const res = await fetch(`/api/media?folder=${encodeURIComponent(folder)}`);
    if (res.ok) {
      const data = await res.json();
      setFolders(data.folders);
      setFiles(data.files);
      setCurrentFolder(data.currentFolder);
      setBreadcrumbs(data.breadcrumbs);
    }
  }, []);

  useEffect(() => { loadMedia(''); }, [loadMedia]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', currentFolder);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) loadMedia(currentFolder);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800">Select Image</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 text-xl"
          >
            ×
          </button>
        </div>

        {/* Breadcrumbs + Upload */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 flex-wrap">
          <button
            onClick={() => loadMedia('')}
            className={`px-3 py-1 rounded-full border text-xs transition-colors ${
              !currentFolder ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            📁 Root
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">/</span>
              <button
                onClick={() => loadMedia(crumb.path)}
                className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                  i === breadcrumbs.length - 1
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                📁 {crumb.name}
              </button>
            </span>
          ))}
          <label className="ml-auto cursor-pointer px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5">
            {uploading ? '⏳ Uploading...' : '⬆️ Upload Image'}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              This folder is empty. Upload an image to get started.
            </div>
          )}

          {folders.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Folders</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {folders.map(folder => {
                  const fullPath = currentFolder ? `${currentFolder}/${folder}` : folder;
                  return (
                    <button
                      key={folder}
                      onClick={() => loadMedia(fullPath)}
                      className="bg-white border border-slate-200 rounded-xl p-3 text-center hover:border-emerald-500 hover:shadow-md transition-all"
                    >
                      <div className="text-3xl mb-1">📁</div>
                      <div className="text-xs truncate font-medium text-slate-700">{folder}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Images</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {files.filter(f => f.type === 'image').map(file => (
                  <button
                    key={file.filename}
                    onClick={() => { onSelect(file.path); onClose(); }}
                    className="group relative bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-lg transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.path} alt={file.filename} className="w-full h-20 object-cover" />
                    <div className="absolute inset-0 bg-emerald-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Select</span>
                    </div>
                    <div className="px-2 py-1">
                      <p className="text-[10px] truncate text-slate-500 font-mono">{file.filename}</p>
                    </div>
                  </button>
                ))}
                {files.filter(f => f.type !== 'image').map(file => (
                  <button
                    key={file.filename}
                    onClick={() => { onSelect(file.path); onClose(); }}
                    className="group relative bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-lg transition-all"
                  >
                    <div className="w-full h-20 flex items-center justify-center bg-slate-50 text-3xl">📄</div>
                    <div className="absolute inset-0 bg-emerald-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Select</span>
                    </div>
                    <div className="px-2 py-1">
                      <p className="text-[10px] truncate text-slate-500 font-mono">{file.filename}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}