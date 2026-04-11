// /api/category — CRUD de categorías de productos
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// GET /api/category — Listar todas las categorías
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(categories);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/category — Crear categoría
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const slug = toSlug(name);
    const category = await prisma.category.create({ data: { name: name.trim(), slug } });
    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/category — Actualizar categoría
export async function PUT(req: NextRequest) {
  try {
    const { id, name } = await req.json();
    if (!id || !name?.trim()) return NextResponse.json({ error: 'ID y nombre requeridos' }, { status: 400 });

    const slug = toSlug(name);
    const category = await prisma.category.update({ where: { id }, data: { name: name.trim(), slug } });
    return NextResponse.json(category);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/category?id=xxx — Eliminar categoría
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    // Desasociar productos antes de borrar
    await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
