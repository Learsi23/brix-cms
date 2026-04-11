// /api/product — CRUD de productos
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/product — Listar productos (opcionalmente filtrar por category)
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const category = req.nextUrl.searchParams.get('category');
    const categorySlug = req.nextUrl.searchParams.get('categorySlug');

    if (id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = await (prisma.product as any).findUnique({
        where: { id },
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
      if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      return NextResponse.json(product);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (category) where.categoryName = category;
    if (categorySlug) where.category = { slug: categorySlug };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (prisma.product as any).findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Transformar para devolver category como string (igual que .NET)
    const transformed = products.map((p: any) => ({
      ...p,
      category: p.categoryName || p.category?.name || null,
    }));

    return NextResponse.json(transformed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/product — Crear producto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, description, price, stock, imageUrl, stripePriceId, category,
      originalPrice, sku, badge, tags, sizes, colors, longDescription,
      rating, reviewCount
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product as any).create({
      data: {
        name,
        description: description || '',
        longDescription: longDescription || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        stripePriceId: stripePriceId || null,
        categoryName: category || null,
        sku: sku || null,
        badge: badge || null,
        tags: tags || null,
        sizes: sizes || null,
        colors: colors || null,
        rating: rating ? parseFloat(rating) : null,
        reviewCount: reviewCount ? parseInt(reviewCount) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/product — Actualizar producto
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id, name, description, longDescription, price, stock, imageUrl, stripePriceId, category,
      originalPrice, sku, badge, tags, sizes, colors, rating, reviewCount
    } = body;

    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product as any).update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(stripePriceId !== undefined && { stripePriceId }),
        ...(category !== undefined && { categoryName: category || null }),
        ...(sku !== undefined && { sku }),
        ...(badge !== undefined && { badge }),
        ...(tags !== undefined && { tags }),
        ...(sizes !== undefined && { sizes }),
        ...(colors !== undefined && { colors }),
        ...(rating !== undefined && { rating: rating ? parseFloat(rating) : null }),
        ...(reviewCount !== undefined && { reviewCount: reviewCount ? parseInt(reviewCount) : null }),
      },
    });

    return NextResponse.json(product);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/product?id=xxx — Eliminar producto
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    
    console.log('[DELETE] Attempting to delete product:', id);
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      console.log('[DELETE] Product not found:', id);
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    
    console.log('[DELETE] Found product:', product.name);
    
    // Check for related cart items that might block deletion
    const cartItems = await prisma.cartItem.findMany({ where: { productId: id } });
    console.log('[DELETE] Cart items count:', cartItems.length);
    
    // Delete related cart items first (to be safe)
    if (cartItems.length > 0) {
      await prisma.cartItem.deleteMany({ where: { productId: id } });
      console.log('[DELETE] Deleted cart items');
    }
    
    await prisma.product.delete({ where: { id } });
    console.log('[DELETE] Product deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[DELETE] Delete error:', err);
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
