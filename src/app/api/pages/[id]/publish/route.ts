// POST /api/pages/:id/publish
// Publica la página reemplazando todos sus bloques.
// Equivalente a PublishPage en ManagerController.cs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { PublishPageDto } from '@/lib/blocks';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const data: PublishPageDto & { publish?: boolean } = await req.json();
    const shouldPublish = data.publish !== false;
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });

    // Actualizar metadatos de la página
    await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug.toLowerCase().trim().replace(/\s+/g, '-'),
        description: data.description || null,
        ogImage: data.ogImage || null,
        jsonData: data.jsonData ?? null,
        ...(shouldPublish ? { isPublished: true, publishedAt: new Date() } : {}),
      },
    });

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

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
