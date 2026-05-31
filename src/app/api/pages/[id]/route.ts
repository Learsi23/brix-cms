// GET /api/pages/:id — obtener página con bloques
// PATCH /api/pages/:id — actualizar título/slug
// DELETE /api/pages/:id — eliminar página
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { removePageFromNav } from '@/lib/nav-sync';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { sortOrder: 'asc' } },
      parent: { select: { id: true, title: true, slug: true } },
      children: { select: { id: true, title: true, slug: true } },
    },
  });
  if (!page) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  try {
    const current = await prisma.page.findUnique({ where: { id }, select: { parentId: true } });
    if (!current) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    // If slug is being updated, check uniqueness among siblings
    if (body.slug) {
      body.slug = body.slug.toLowerCase().trim().replace(/\s+/g, '-');
      const parentId = body.parentId !== undefined ? body.parentId : current.parentId;
      const existing = await prisma.page.findFirst({
        where: { slug: body.slug, parentId: parentId, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Ya existe una página con ese slug en el mismo nivel' }, { status: 400 });
      }
    }

    const page = await prisma.page.update({ where: { id }, data: body });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
}

async function collectDescendantIds(id: string): Promise<string[]> {
  const ids: string[] = [id];
  const children = await prisma.page.findMany({ where: { parentId: id }, select: { id: true } });
  for (const child of children) {
    const descendantIds = await collectDescendantIds(child.id);
    ids.push(...descendantIds);
  }
  return ids;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const page = await prisma.page.findUnique({ where: { id }, select: { slug: true, isPublished: true } });
    if (page?.isPublished && page.slug) {
      await removePageFromNav(page.slug);
    }
    const allIds = await collectDescendantIds(id);
    await prisma.block.deleteMany({ where: { pageId: { in: allIds } } });
    await prisma.page.deleteMany({ where: { id: { in: allIds } } });
    return NextResponse.json({ success: true, deleted: allIds.length });
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
}
