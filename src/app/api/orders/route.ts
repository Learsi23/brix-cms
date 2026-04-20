// GET /api/orders — fetch all orders with their order items and products
// Supports query params: ?status=pending|paid|processing|completed|cancelled&limit=50&offset=0
// PATCH /api/orders — update order status { id, status }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const VALID_STATUSES = ['pending', 'paid', 'processing', 'completed', 'cancelled'] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(s: string): s is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(s);
}

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    // Build where clause — omit filter when status is "all" or absent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status && status !== 'all' && isValidStatus(status)) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          orderItems: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/orders — update status
// Body: { id: string, status: string }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!status || !isValidStatus(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { orderItems: true },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
