// /api/admin/products — Admin CRUD de productos
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 

// GET /api/admin/products — Listar todos los productos (con filtros)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = req.nextUrl.searchParams.get('category');
    const search = req.nextUrl.searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { category: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true } } },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products, categories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/products — Crear producto
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      longDescription,
      price,
      originalPrice,
      currencySymbol,
      stock,
      imageUrl,
      imagesJson,
      categoryId,
      tags,
      sizes,
      colors,
      customOptions,
      badge,
      rating,
      reviewCount,
      sku,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        longDescription: longDescription || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        currencySymbol: currencySymbol || null,
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        imagesJson: imagesJson || null,
        categoryId: categoryId || null,
        tags: tags || null,
        sizes: sizes || null,
        colors: colors || null,
        customOptions: customOptions || null,
        badge: badge || null,
        rating: rating ? parseFloat(rating) : null,
        reviewCount: reviewCount ? parseInt(reviewCount) : null,
        sku: sku || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/products — Actualizar producto
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      name,
      description,
      longDescription,
      price,
      originalPrice,
      currencySymbol,
      stock,
      imageUrl,
      imagesJson,
      categoryId,
      tags,
      sizes,
      colors,
      customOptions,
      badge,
      rating,
      reviewCount,
      sku,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(currencySymbol && { currencySymbol }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imagesJson !== undefined && { imagesJson }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(tags !== undefined && { tags }),
        ...(sizes !== undefined && { sizes }),
        ...(colors !== undefined && { colors }),
        ...(customOptions !== undefined && { customOptions }),
        ...(badge !== undefined && { badge }),
        ...(rating !== undefined && { rating: rating ? parseFloat(rating) : null }),
        ...(reviewCount !== undefined && { reviewCount: reviewCount ? parseInt(reviewCount) : null }),
        ...(sku !== undefined && { sku }),
      },
    });

    return NextResponse.json(product);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/products?id=xxx — Eliminar producto
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}