'use client';

// Backup & Restore page - equivalent to Backup/Index.cshtml in .NET
import { useState, useRef } from 'react';

export default function BackupPage() {
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [replaceAll, setReplaceAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eden-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setMsg({ type: 'success', text: 'Backup exported successfully' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to export backup' });
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setMsg(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('replaceAll', replaceAll.toString());
      
      const res = await fetch('/api/backup', {
        method: 'POST',
        body: formData,
      });
      
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Import failed');
      
      setMsg({ type: 'success', text: d.message });
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Import failed' });
    }
    
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Backup & Restore</h1>
        <p className="text-gray-400 text-sm">Export and import all pages and blocks.</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
          msg.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          {msg.text}
        </div>
      )}

      {/* Export */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <i className="fas fa-download text-white text-sm" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm">Export Backup</h2>
            <p className="text-slate-400 text-xs">Download a JSON file with all pages and blocks.</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            The backup includes all pages (published and drafts) with all their blocks and SEO configuration.
          </p>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
          >
            <i className="fas fa-download"></i> Download Backup JSON
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-600 to-orange-600">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <i className="fas fa-upload text-white text-sm" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm">Import Backup</h2>
            <p className="text-amber-100 text-xs">Restore pages from a JSON backup file.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">JSON File</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="replaceAll"
              checked={replaceAll}
              onChange={e => setReplaceAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-600"
            />
            <label htmlFor="replaceAll" className="text-sm text-gray-700">
              <span className="font-bold text-red-600">Replace all</span>
              {' '}— delete all current pages before importing
            </label>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            <i className="fas fa-upload mr-2"></i>
            {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
