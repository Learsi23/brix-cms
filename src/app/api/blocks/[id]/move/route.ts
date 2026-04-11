// POST /api/blocks/:id/move — mover bloque arriba/abajo
// Equivalente a MoveBlock en ManagerController.cs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { direction } = await req.json();
    const block = await prisma.block.findUnique({ where: { id } });
    if (!block) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const siblings = await prisma.block.findMany({
      where: { pageId: block.pageId, parentId: block.parentId },
      orderBy: { sortOrder: 'asc' },
    });

    const idx = siblings.findIndex(b => b.id === id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= siblings.length) return NextResponse.json({ success: true });

    await prisma.$transaction([
      prisma.block.update({ where: { id: siblings[idx].id }, data: { sortOrder: siblings[newIdx].sortOrder } }),
      prisma.block.update({ where: { id: siblings[newIdx].id }, data: { sortOrder: siblings[idx].sortOrder } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
