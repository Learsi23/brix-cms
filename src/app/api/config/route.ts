// /api/config  -API for site configuration management

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/config?key=site
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') || 'site';
  const config = await prisma.siteConfig.findUnique({ where: { key } });
  if (!config) return NextResponse.json({ key, value: null });
  try {
    return NextResponse.json({ key, value: JSON.parse(config.value) });
  } catch {
    return NextResponse.json({ key, value: config.value });
  }
}

// POST /api/config — guardar configuración
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key = 'site', value } = body as { key: string; value: unknown };
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: { value: jsonValue },
      create: { key, value: jsonValue },
    });
    return NextResponse.json({ success: true, config });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
