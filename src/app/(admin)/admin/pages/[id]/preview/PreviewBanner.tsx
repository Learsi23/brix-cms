'use client';

import { useState } from 'react';

interface PreviewBannerProps {
  pageId: string;
  pageSlug: string;
  isPublished: boolean;
  publishedAt: string | null;
  allBlocksJson: string;
  title: string;
  slug: string;
  jsonData: string;
}

export default function PreviewBanner({
  pageId,
  pageSlug,
  isPublished,
  publishedAt,
  allBlocksJson,
  title,
  slug,
  jsonData,
}: PreviewBannerProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  async function publishFromPreview() {
    if (!confirm('Publish this page? It will become publicly visible.')) return;

    setPublishing(true);
    try {
      const blocks = JSON.parse(allBlocksJson);
      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, jsonData, blocks }),
      });
      const result = await res.json();
      if (result.success) {
        setPublished(true);
        setTimeout(() => {
          window.location.href = `/admin/pages/${pageId}/edit`;
        }, 1000);
      } else {
        alert('❌ Error publishing: ' + result.error);
      }
    } catch (e) {
      alert('❌ Network error: ' + (e as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-3 z-50 shadow-lg flex items-center justify-center gap-4 text-sm">
      <span>🔍 PREVIEW MODE</span>

      {isPublished ? (
        <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-bold">
          ✅ Published — {publishedAt}
        </span>
      ) : (
        <span className="bg-gray-700 px-3 py-1 rounded-full text-xs font-bold">
          📝 Draft
        </span>
      )}

      <a
        href={`/admin/pages/${pageId}/edit`}
        className="underline font-bold text-sm"
      >
        ← Back to Editor
      </a>

      <button
        onClick={publishFromPreview}
        disabled={publishing || published}
        className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${published ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-75`}
      >
        {published ? '✅ Published' : publishing ? '⏳ Publishing...' : '🚀 Publish'}
      </button>
    </div>
  );
}