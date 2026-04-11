"use client";

import { useState, useEffect } from "react";
import AIPageGenerator from "@/components/admin/AIPageGenerator";

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function AIGeneratorPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const res = await fetch("/api/pages");
        const data = await res.json();
        setPages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading pages:", error);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🤖 AI Page Generator</h1>
          <p className="text-gray-500 text-sm mt-1">Create new pages or update existing ones with AI.</p>
        </div>
        <button onClick={() => setShowAIGenerator(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
          ✨ Create Page with AI
        </button>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIPageGenerator onClose={() => setShowAIGenerator(false)} />
      )}

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 text-sm">📋 Pages</h2>
          <a href="/admin" className="text-xs text-violet-600 hover:underline font-semibold">View all →</a>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : pages.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            <p className="text-3xl mb-2">🤖</p><p>No pages yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">URL</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map(pg => (
                <tr key={pg.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-800">{pg.title}</td>
                  <td className="px-6 py-3 text-gray-400 font-mono text-xs">/{pg.slug}</td>
                  <td className="px-6 py-3">
                    {pg.isPublished ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✅ Published</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">✏️ Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {pg.publishedAt ? new Date(pg.publishedAt).toISOString().split('T')[0] : '—'}
                  </td>
                  <td className="px-6 py-3 flex items-center gap-3">
                    <a href={`/admin/pages/${pg.id}/preview`} className="text-xs font-semibold text-violet-600 hover:underline">Preview →</a>
                    <a href={`/admin/pages/${pg.id}/edit`} className="text-xs text-gray-400 hover:text-gray-600">Edit</a>
                    <button onClick={() => { setPageToUpdate(pg.id); setShowAIGenerator(true); }} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">✏️ AI Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 text-sm mb-3">💡 Tips</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-violet-400">•</span> Describe purpose, audience, and colors</li>
            <li className="flex gap-2"><span className="text-violet-400">•</span> Mention specific blocks (hero, cards, FAQ)</li>
            <li className="flex gap-2"><span className="text-violet-400">•</span> Reference a PDF for product data</li>
            <li className="flex gap-2"><span className="text-violet-400">•</span> The AI will ask for images and details</li>
            <li className="flex gap-2"><span className="text-blue-400">•</span> Use <strong>AI Update</strong> to modify existing pages</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 text-sm mb-3">⚡ Provider</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-indigo-400">•</span> <a href="/admin/ai-config" className="text-violet-600 underline">Settings → AI Config</a></li>
            <li className="flex gap-2"><span className="text-indigo-400">•</span> <a href="/admin/media" className="text-violet-600 underline">Media Library</a> — upload images first</li>
            <li className="flex gap-2"><span className="text-indigo-400">•</span> Generation: 10–30 sec with Gemini</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function setPageToUpdate(id: string) {
  // This will be handled by the AIPageGenerator component
}
