// PATCH /api/blocks/:id — guardar datos JSON del bloque
// DELETE /api/blocks/:id — eliminar bloque (recursivo)
// Equivalente a SaveBlock y DeleteBlock en ManagerController.cs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { jsonData } = await req.json();
    const block = await prisma.block.update({
      where: { id },
      data: { jsonData: typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData) },
    });
    return NextResponse.json(block);
  } catch {
    return NextResponse.json({ error: 'Bloque no encontrado' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    // Borrado recursivo: hijos y nietos
    const children = await prisma.block.findMany({ where: { parentId: id } });
    for (const child of children) {
      await prisma.block.deleteMany({ where: { parentId: child.id } });
    }
    await prisma.block.deleteMany({ where: { parentId: id } });
    await prisma.block.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Bloque no encontrado' }, { status: 404 });
  }
}
