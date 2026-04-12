import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Basic Stripe setup — secret key for checkout
// Stripe Connect / multi-vendor is a Pro feature

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'stripe_setup' } });
    if (!config) return NextResponse.json({ configured: false });
    const data = JSON.parse(config.value);
    return NextResponse.json({ configured: true, hasKey: !!data.secretKey });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { secretKey, publishableKey } = await req.json();

    if (!secretKey || !secretKey.startsWith('sk_')) {
      return NextResponse.json({ error: 'Invalid secret key (must start with sk_)' }, { status: 400 });
    }

    await prisma.siteConfig.upsert({
      where: { key: 'stripe_setup' },
      update: { value: JSON.stringify({ secretKey, publishableKey, savedAt: new Date().toISOString() }) },
      create: { key: 'stripe_setup', value: JSON.stringify({ secretKey, publishableKey, savedAt: new Date().toISOString() }) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.siteConfig.delete({ where: { key: 'stripe_setup' } }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
