// POST /api/pages/:id/blocks — añadir un nuevo bloque a la página
// Equivalente a AddBlock en ManagerController.cs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { blockType, parentId = null } = await req.json();
    if (!blockType) return NextResponse.json({ error: 'blockType es requerido' }, { status: 400 });

    const count = await prisma.block.count({ where: { pageId: id, parentId } });

    const block = await prisma.block.create({
      data: {
        type: blockType,
        jsonData: '{}',
        sortOrder: count,
        pageId: id,
        parentId,
      },
    });
    return NextResponse.json(block, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
