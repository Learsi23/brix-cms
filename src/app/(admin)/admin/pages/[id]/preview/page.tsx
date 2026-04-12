// Preview page — equivalent to Preview.cshtml in .NET
// Shows the page as it will appear when published, with preview banner and Publish button

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { BlockData } from '@/lib/blocks/types';
import PreviewBanner from './PreviewBanner';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    include: { blocks: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!page) return notFound();

  const allBlocks = page.blocks;
  const rootBlocks = allBlocks.filter(b => !b.parentId);
  const childrenByParent = allBlocks
    .filter(b => b.parentId)
    .reduce<Record<string, typeof allBlocks>>((acc, b) => {
      if (!acc[b.parentId!]) acc[b.parentId!] = [];
      acc[b.parentId!].push(b);
      return acc;
    }, {});

  const pageSettings = page.jsonData ? JSON.parse(page.jsonData) : {};
  const bgColor = pageSettings.BackgroundColor?.Value ?? '#ffffff';

  // Serialize all blocks for the publish button (same as .NET)
  const allBlocksForPublish = allBlocks
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(b => ({
      originalId: b.id,
      type: b.type,
      jsonData: b.jsonData ?? '{}',
      sortOrder: b.sortOrder,
      parentId: b.parentId,
    }));

  const publishedAtStr = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      {/* Preview banner (client) */}
      <PreviewBanner
        pageId={page.id}
        pageSlug={page.slug}
        isPublished={page.isPublished}
        publishedAt={publishedAtStr}
        allBlocksJson={JSON.stringify(allBlocksForPublish)}
        title={page.title}
        slug={page.slug}
        jsonData={page.jsonData ?? '{}'}
      />

      {/* Spacer so content doesn't sit under the banner */}
      <div style={{ paddingTop: '60px' }} />

      {/* Page content */}
      <main style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 60px)', width: '100%' }}>
        {rootBlocks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>📭 No blocks to display</p>
            <a href={`/admin/pages/${page.id}/edit`} className="text-indigo-600 text-sm mt-2 inline-block">
              ← Back to editor
            </a>
          </div>
        ) : (
          rootBlocks.map(block => {
            const data: BlockData = block.jsonData ? JSON.parse(block.jsonData) : {};
            const children = childrenByParent[block.id] ?? [];
            return (
              <div key={block.id}>
                <BlockRenderer
                  type={block.type}
                  data={data}
                  blocks={children.map(c => ({
                    id: c.id,
                    type: c.type,
                    jsonData: c.jsonData,
                  }))}
                />
              </div>
            );
          })
        )}
      </main>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id }, select: { title: true } });
  return { title: `PREVIEW — ${page?.title ?? 'Page'}` };
}