// Preview page — equivalente a Preview.cshtml en .NET
// Muestra la página tal como se verá publicada, con banner de preview y botón Publicar

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

  // Serializar todos los bloques para el botón de publicar (igual que .NET)
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
    ? new Date(page.publishedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      {/* Banner de preview (cliente) */}
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

      {/* Spacer para que el contenido no quede bajo el banner */}
      <div style={{ paddingTop: '60px' }} />

      {/* Contenido de la página */}
      <main style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 60px)', width: '100%' }}>
        {rootBlocks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>📭 Sin bloques para mostrar</p>
            <a href={`/admin/pages/${page.id}/edit`} className="text-indigo-600 text-sm mt-2 inline-block">
              ← Volver al editor
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
  return { title: `PREVIEW — ${page?.title ?? 'Página'}` };
}
