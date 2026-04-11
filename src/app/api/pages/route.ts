// GET /api/pages — listar páginas
// POST /api/pages — crear página
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const pages = await prisma.page.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, slug: true, isPublished: true, publishedAt: true, sortOrder: true, pageType: true, createdAt: true },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  try {
    const { title, slug, pageType = 'standard', description, ogImage } = await req.json();
    if (!title || !slug) {
      return NextResponse.json({ error: 'title y slug son requeridos' }, { status: 400 });
    }
    const maxOrder = await prisma.page.aggregate({ _max: { sortOrder: true } });
    const page = await prisma.page.create({
      data: {
        title,
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
        pageType,
        description: description || null,
        ogImage: ogImage || null,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
