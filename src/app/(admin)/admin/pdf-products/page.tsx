"use client";

import { useState, useEffect } from "react";

interface ExtractedProduct {
  name: string;
  description: string;
  price: string | number;
  stock: string | number;
  category: string;
  sizes: string;
  colors: string;
  badge: string;
  sku: string;
  imageUrl: string;
}

export default function PdfProductsPage() {
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadPdfs(); }, []);

  async function loadPdfs() {
    const res = await fetch("/api/pdf-products/upload");
    const data = await res.json() as { files: string[] };
    setPdfs(data.files ?? []);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/pdf-products/upload", { method: "POST", body: fd });
      const data = await res.json() as { fileName?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      showToast(`✅ ${data.fileName} uploaded`);
      await loadPdfs();
      setSelectedPdf(data.fileName!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(fileName: string) {
    if (!confirm(`Delete ${fileName}?`)) return;
    await fetch(`/api/pdf-products/upload?file=${encodeURIComponent(fileName)}`, { method: "DELETE" });
    await loadPdfs();
    if (selectedPdf === fileName) setSelectedPdf("");
  }

  async function handleExtract() {
    if (!selectedPdf) return;
    setExtracting(true);
    setError("");
    setProducts([]);
    try {
      const res = await fetch("/api/pdf-products/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selectedPdf }),
      });
      const data = await res.json() as { products?: ExtractedProduct[]; error?: string; raw?: string };
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      setProducts(data.products ?? []);
      showToast(`✅ ${data.products?.length ?? 0} products extracted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction error");
    } finally {
      setExtracting(false);
    }
  }

  async function handleImport() {
    if (products.length === 0) return;
    setImporting(true);
    setError("");
    try {
      const res = await fetch("/api/pdf-products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const data = await res.json() as { imported?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      showToast(`✅ ${data.imported} products imported to catalogue`);
      setProducts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import error");
    } finally {
      setImporting(false);
    }
  }

  function updateField(i: number, field: keyof ExtractedProduct, value: string) {
    setProducts((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function removeRow(i: number) {
    setProducts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const inputCls = "w-full px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400";

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg">📑</div>
        <div>
          <h1 className="text-xl font-black text-slate-900">PDF → Products</h1>
          <p className="text-xs text-slate-400">Upload a catalogue PDF, extract products with AI, import to your store</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <span>⚠️</span>
          <div>
            <p className="font-medium">{error}</p>
            {error.includes("AI") && (
              <p className="mt-1 text-xs">Check your AI provider configuration at <a href="/admin/ai-config" className="underline">Configuration</a>.</p>
            )}
          </div>
        </div>
      )}

      {/* PDF Library */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>📂</span> PDF Library
        </h2>

        <div className="flex items-center gap-3">
          <label className={`cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? "Uploading…" : "Upload PDF"}
            <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <span className="text-xs text-slate-400">{pdfs.length} file{pdfs.length !== 1 ? "s" : ""} in library</span>
        </div>

        {pdfs.length > 0 && (
          <ul className="space-y-1">
            {pdfs.map((f) => (
              <li key={f} className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition text-sm ${selectedPdf === f ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent"}`}
                onClick={() => setSelectedPdf(f)}>
                <span className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="font-medium text-slate-700">{f}</span>
                  {selectedPdf === f && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">SELECTED</span>}
                </span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(f); }}
                  className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Extract */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>🤖</span> Extract Products with AI
        </h2>
        <p className="text-xs text-slate-500">Select a PDF above, then click Extract. AI will read the catalogue and detect all products.</p>
        <button
          onClick={handleExtract}
          disabled={!selectedPdf || extracting}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition flex items-center gap-2"
        >
          {extracting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {extracting ? "Extracting…" : selectedPdf ? `Extract from ${selectedPdf}` : "Select a PDF first"}
        </button>
      </div>

      {/* Review & Import */}
      {products.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>✏️</span> Review & Import — {products.length} products
            </h2>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 transition flex items-center gap-2"
            >
              {importing && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {importing ? "Importing…" : "Import to Catalogue"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Name","Price","Stock","Category","Sizes","Colors","Badge","Description"].map((h) => (
                    <th key={h} className="text-left px-2 py-2 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5"><input className={inputCls} value={p.name} onChange={(e) => updateField(i, "name", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={`${inputCls} w-20`} value={String(p.price)} onChange={(e) => updateField(i, "price", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={`${inputCls} w-16`} value={String(p.stock)} onChange={(e) => updateField(i, "stock", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={inputCls} value={p.category} onChange={(e) => updateField(i, "category", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={inputCls} value={p.sizes} onChange={(e) => updateField(i, "sizes", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={inputCls} value={p.colors} onChange={(e) => updateField(i, "colors", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={`${inputCls} w-20`} value={p.badge} onChange={(e) => updateField(i, "badge", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className={inputCls} value={p.description} onChange={(e) => updateField(i, "description", e.target.value)} /></td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-base leading-none">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
