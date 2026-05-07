// /api/chat/config — Get/Set Ollama configuration
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const config = await prisma.siteConfig.findMany({
      where: { key: { startsWith: 'ollama' } }
    });

    const ollamaConfig: Record<string, string> = {};
    for (const c of config) {
      ollamaConfig[c.key] = c.value;
    }

    return NextResponse.json(ollamaConfig);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, model } = body;

    if (url) {
      await prisma.siteConfig.upsert({
        where: { key: 'ollama_url' },
        update: { value: url },
        create: { key: 'ollama_url', value: url }
      });
    }

    if (model) {
      await prisma.siteConfig.upsert({
        where: { key: 'ollama_model' },
        update: { value: model },
        create: { key: 'ollama_model', value: model }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}