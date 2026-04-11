'use client';

import { use, useEffect, useState } from 'react';
import BlockEditor from '@/components/admin/BlockEditor';

interface PageData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  ogImage: string | null;
  jsonData: string | null;
  isPublished: boolean;
  pageType: string;
  blocks: Array<{
    id: string;
    type: string;
    sortOrder: number;
    jsonData: string | null;
    parentId: string | null;
  }>;
}

export default function EditPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPage(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">
      Loading editor...
    </div>
  );

  if (!page) return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <div>
        <p className="text-slate-500 mb-4">Page not found</p>
        <a href="/admin" className="text-emerald-600 hover:underline text-sm">← Back</a>
      </div>
    </div>
  );

  return (
    <BlockEditor
      initialBlocks={page.blocks}
      pageId={page.id}
      pageTitle={page.title}
      pageSlug={page.slug}
      pageIsPublished={page.isPublished}
      pageJsonData={page.jsonData}
      pageDescription={page.description}
      pageOgImage={page.ogImage}
      onPublished={() => window.location.reload()}
    />
  );
}
