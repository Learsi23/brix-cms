// POST /api/pages/move — mover página arriba/abajo en el listado
// Equivalente a MovePage en ManagerController.cs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { pageId, direction } = await req.json();
    const pages = await prisma.page.findMany({ orderBy: { sortOrder: 'asc' } });
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1) return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return NextResponse.json({ success: true });

    // Intercambiar sortOrder
    await prisma.$transaction([
      prisma.page.update({ where: { id: pages[index].id }, data: { sortOrder: pages[newIndex].sortOrder } }),
      prisma.page.update({ where: { id: pages[newIndex].id }, data: { sortOrder: pages[index].sortOrder } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
