// /api/chat/config — Get / Set AI chatbot configuration
// Supports: Ollama (local) and Gemini (cloud, OpenAI-compat endpoint)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const KEYS = ['ollama_url', 'ollama_model', 'ai_provider', 'gemini_api_key', 'gemini_model'] as const;

export async function GET() {
  try {
    const rows = await prisma.siteConfig.findMany({
      where: { key: { in: [...KEYS] } },
    });

    const cfg: Record<string, string> = {};
    for (const row of rows) cfg[row.key] = row.value;

    // Mask the Gemini key — only expose whether it is set
    return NextResponse.json({
      ...cfg,
      gemini_api_key:     cfg.gemini_api_key ? '••••••••' : '',
      gemini_key_is_set:  !!cfg.gemini_api_key,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;

    const allowed: (typeof KEYS[number])[] = [...KEYS];

    for (const key of allowed) {
      const val = body[key];
      if (val === undefined) continue;

      // Empty string on gemini_api_key = delete the key
      if (key === 'gemini_api_key' && val === '') {
        await prisma.siteConfig.deleteMany({ where: { key } });
        continue;
      }

      if (val !== '') {
        await prisma.siteConfig.upsert({
          where:  { key },
          update: { value: val },
          create: { key, value: val },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
