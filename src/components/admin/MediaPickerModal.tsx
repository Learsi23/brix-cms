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
  const [folders, setFolders]             = useState<string[]>([]);
  const [files, setFiles]                 = useState<MediaFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [breadcrumbs, setBreadcrumbs]     = useState<Breadcrumb[]>([]);
  const [uploading, setUploading]         = useState(false);
  const [uploadCount, setUploadCount]     = useState(0);
  const [uploadError, setUploadError]     = useState<string | null>(null);

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
    const fileList = e.target.files;
    if (!fileList?.length) return;

    setUploading(true);
    setUploadError(null);
    setUploadCount(fileList.length);

    const fd = new FormData();
    Array.from(fileList).forEach(f => fd.append('file', f));
    fd.append('folder', currentFolder);

    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok && res.status !== 207) {
        throw new Error(data.error ?? 'Upload failed');
      }
      if (data.errors?.length) {
        setUploadError(`${data.errors.length} file(s) failed to upload.`);
      }
      await loadMedia(currentFolder);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
      setUploadCount(0);
      e.target.value = '';
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-black text-slate-800">Select Image</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 text-xl">×</button>
        </div>

        {/* Breadcrumbs + upload */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 flex-wrap flex-shrink-0">
          <button
            onClick={() => loadMedia('')}
            className={`px-3 py-1 rounded-full border text-xs transition-colors ${!currentFolder ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
          >
            📁 Root
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">/</span>
              <button
                onClick={() => loadMedia(crumb.path)}
                className={`px-3 py-1 rounded-full border text-xs transition-colors ${i === breadcrumbs.length - 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                📁 {crumb.name}
              </button>
            </span>
          ))}

          {/* Upload button */}
          <label className="ml-auto cursor-pointer px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5">
            {uploading ? `⏳ Uploading ${uploadCount}…` : '⬆️ Upload'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="mx-6 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 flex-shrink-0">
            <span>❌ {uploadError}</span>
            <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              This folder is empty. Upload images to get started.
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Images
                <span className="ml-2 text-slate-300 font-normal normal-case">— click to select</span>
              </p>
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
                      <span className="text-white text-xs font-bold">✓ Select</span>
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
                      <span className="text-white text-xs font-bold">✓ Select</span>
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
