// GET /api/pages/:id — obtener página con bloques
// PATCH /api/pages/:id — actualizar título/slug
// DELETE /api/pages/:id — eliminar página
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!page) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  try {
    const page = await prisma.page.update({ where: { id }, data: body });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    // Los bloques se eliminan en cascada por el schema
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
}
