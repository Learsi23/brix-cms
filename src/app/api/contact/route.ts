import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name, email, message, recipientEmail } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Store contact submission in the database using SiteConfig as a log
  // (a dedicated Contact model can be added to schema.prisma for production use)
  const key = `contact_${Date.now()}`;
  await prisma.siteConfig.create({
    data: {
      key,
      value: JSON.stringify({ name, email, message, recipientEmail, sentAt: new Date().toISOString() }),
    },
  });

  return NextResponse.json({ success: true });
}
