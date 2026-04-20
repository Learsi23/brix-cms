// POST /api/pdf-products/import
// Saves an array of extracted products into the database.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

interface ExtractedProduct {
  name: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  category?: string;
  sizes?: string;
  colors?: string;
  badge?: string;
  sku?: string;
  imageUrl?: string;
}

export async function POST(req: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get('eden_auth');
  if (!token?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { products } = (await req.json()) as { products: ExtractedProduct[] };
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    let imported = 0;

    for (const p of products) {
      const name = p.name?.trim();
      if (!name) continue;

      const price = typeof p.price === 'number' ? p.price : parseFloat(String(p.price ?? '0')) || 0;
      const stock = typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock ?? '0'), 10) || 0;

      await prisma.product.create({
        data: {
          name,
          description:   p.description?.trim() || null,
          price,
          stock,
          categoryName:  p.category?.trim() || null,
          sizes:         p.sizes?.trim() || null,
          colors:        p.colors?.trim() || null,
          badge:         p.badge?.trim() || null,
          imageUrl:      p.imageUrl?.trim() || null,
          currencySymbol: '€',
        },
      });
      imported++;
    }

    return NextResponse.json({ imported });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
