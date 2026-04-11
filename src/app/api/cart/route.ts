// /api/cart — Carrito de compras
// Equivalente al CartController de .NET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/cart?sessionKey=xxx — Obtener items del carrito
export async function GET(req: NextRequest) {
  try {
    const sessionKey = req.nextUrl.searchParams.get('sessionKey');
    if (!sessionKey) return NextResponse.json({ items: [], totalProducts: 0 });

    const items = await prisma.cartItem.findMany({
      where: { sessionId: sessionKey },
      include: { product: true },
    });

    const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ items, totalProducts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/cart — Agregar al carrito
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity = 1, sessionKey } = body;

    if (!productId || !sessionKey) {
      return NextResponse.json({ error: 'ProductId y sessionKey son requeridos' }, { status: 400 });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Buscar item existente en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: { sessionId: sessionKey, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { sessionId: sessionKey, productId, quantity },
      });
    }

    // Obtener total actualizado
    const items = await prisma.cartItem.findMany({ where: { sessionId: sessionKey } });
    const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      message: 'Producto agregado al carrito',
      totalProducts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/cart — Eliminar del carrito
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItemId, sessionKey } = body;

    if (cartItemId) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else if (sessionKey) {
      await prisma.cartItem.deleteMany({ where: { sessionId: sessionKey } });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
