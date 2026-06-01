// POST /api/pages/:id/publish
// Publica la página reemplazando todos sus bloques.
// Equivalente a PublishPage en ManagerController.cs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addPageToNav, removePageFromNav, clearSeedNavItems } from '@/lib/nav-sync';
import type { PublishPageDto } from '@/lib/blocks';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const data: PublishPageDto & { publish?: boolean; parentId?: string | null } = await req.json();
    const shouldPublish = data.publish !== false;
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });

    const updateData: Record<string, unknown> = {
      title: data.title,
      slug: data.slug.toLowerCase().trim().replace(/\s+/g, '-'),
      description: data.description || null,
      ogImage: data.ogImage || null,
      jsonData: data.jsonData ?? null,
    };

    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }

    if (shouldPublish) {
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
      // This page is now a real page, no longer a demo seed.
      updateData.isSeed = false;
    }

    await prisma.page.update({ where: { id }, data: updateData });

    // Eliminar todos los bloques actuales
    await prisma.block.deleteMany({ where: { pageId: id } });

    // Mapa de ID original → nuevo ID (para resolver parentId)
    const idMap = new Map<string, string>();

    // Insertar bloques raíz primero
    const rootBlocks = data.blocks.filter(b => b.parentId === null);
    for (const b of rootBlocks) {
      const created = await prisma.block.create({
        data: {
          type: b.type,
          jsonData: b.jsonData,
          sortOrder: b.sortOrder,
          pageId: id,
          parentId: null,
        },
      });
      idMap.set(b.originalId, created.id);
    }

    // Insertar bloques hijos con parentId resuelto
    const childBlocks = data.blocks.filter(b => b.parentId !== null);
    for (const b of childBlocks) {
      const resolvedParentId = b.parentId ? (idMap.get(b.parentId) ?? b.parentId) : null;
      const created = await prisma.block.create({
        data: {
          type: b.type,
          jsonData: b.jsonData,
          sortOrder: b.sortOrder,
          pageId: id,
          parentId: resolvedParentId,
        },
      });
      idMap.set(b.originalId, created.id);
    }

    // Sync navbar/footer
    if (page.slug && page.slug !== data.slug) {
      await removePageFromNav(page.slug);
    }
    await addPageToNav(data.title, (data.slug || '').toLowerCase().trim().replace(/\s+/g, '-'), !!data.parentId);

    // Delete the remaining demo/seed pages when the first real page is
    // published (equivalent to PublishPage in ManagerController.cs). Seeds
    // survive page *creation* — they're only cleared on first publish.
    if (shouldPublish) {
      const seeds = await prisma.page.findMany({
        where: { isSeed: true, id: { not: id } },
        select: { id: true },
      });
      if (seeds.length > 0) {
        const seedIds = seeds.map(p => p.id);
        // Subpages of seeds first (FK on parentId), then their blocks, then the pages.
        const seedSubpages = await prisma.page.findMany({
          where: { parentId: { in: seedIds } },
          select: { id: true },
        });
        const allSeedIds = [...seedIds, ...seedSubpages.map(p => p.id)];
        await prisma.block.deleteMany({ where: { pageId: { in: allSeedIds } } });
        await prisma.page.deleteMany({ where: { id: { in: seedSubpages.map(p => p.id) } } });
        await prisma.page.deleteMany({ where: { id: { in: seedIds } } });
        // Drop the leftover demo navbar/footer links (Features, Pro, …).
        await clearSeedNavItems();
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
