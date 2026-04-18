// POST /api/pdf-products/extract
// Reads a PDF from public/data/, sends it to the AI with an extraction prompt,
// returns a JSON array of products.
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';
import { decryptKey } from '@/lib/ai/encryption';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

// ── PDF text extraction (no external deps) ──────────────────────────────────

function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const texts: string[] = [];

  const tjRegex = /\(([^)\\]|\\[\s\S])*\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = tjRegex.exec(content)) !== null) {
    const raw = m[0].slice(1, m[0].lastIndexOf(')'));
    const decoded = raw
      .replace(/\\n/g, ' ').replace(/\\r/g, '').replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\').trim();
    if (decoded.length > 1) texts.push(decoded);
  }

  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  while ((m = tjArrayRegex.exec(content)) !== null) {
    const parts = m[1].match(/\(([^)\\]|\\[\s\S])*\)/g) ?? [];
    const combined = parts.map((p) => p.slice(1, -1)).join('').trim();
    if (combined.length > 1) texts.push(combined);
  }

  return texts.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// ── Provider resolution (mirrors chat/route.ts) ──────────────────────────────

type NamedProvider = 'ollama' | 'gemini' | 'deepseek' | 'mistral';

interface ProviderConfig {
  name: NamedProvider;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

async function resolveProvider(): Promise<ProviderConfig> {
  async function ollamaConfig(): Promise<ProviderConfig> {
    try {
      const [urlRow, modelRow] = await Promise.all([
        prisma.siteConfig.findUnique({ where: { key: 'ollama_url' } }),
        prisma.siteConfig.findUnique({ where: { key: 'ollama_model' } }),
      ]);
      return {
        name: 'ollama',
        baseUrl: urlRow?.value ?? process.env.OLLAMA_URL ?? 'http://localhost:11434',
        model: modelRow?.value ?? process.env.OLLAMA_MODEL ?? 'llama3',
      };
    } catch {
      return { name: 'ollama', baseUrl: 'http://localhost:11434', model: 'llama3' };
    }
  }

  const EXTERNAL: { name: NamedProvider; baseUrl: string; model: string }[] = [
    { name: 'gemini',   baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash-lite' },
    { name: 'deepseek', baseUrl: 'https://api.deepseek.com',                                model: 'deepseek-chat' },
    { name: 'mistral',  baseUrl: 'https://api.mistral.ai/v1',                               model: 'mistral-small-2503' },
  ];

  for (const p of EXTERNAL) {
    try {
      const row = await prisma.apiKey.findUnique({ where: { provider: p.name } });
      if (!row) continue;
      const apiKey = decryptKey(row.encryptedKey, row.iv, row.authTag);
      if (apiKey) return { ...p, apiKey };
    } catch { /* skip */ }
  }

  return ollamaConfig();
}

// ── AI call (non-streaming) ──────────────────────────────────────────────────

const EXTRACTION_SYSTEM_PROMPT = `You are a product data extraction engine.
You receive raw text from a supplier or catalogue PDF.
Extract every product you can identify and return them as a JSON array.
Each object must have these fields (use "" if unknown):
  name, description, price (number or ""), stock (number or 0),
  category, sizes (comma-separated string), colors (comma-separated string),
  badge, sku, imageUrl

Return ONLY the raw JSON array — no markdown, no code fences, no explanation.
Example: [{"name":"T-Shirt","price":29.99,"stock":100,"category":"Clothing","sizes":"S,M,L","colors":"Red,Blue","badge":"New","sku":"","description":"","imageUrl":""}]`;

async function callAI(provider: ProviderConfig, pdfText: string): Promise<string> {
  const messages = [
    { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
    { role: 'user',   content: `Extract all products from this catalogue text:\n\n${pdfText.slice(0, 12000)}` },
  ];

  const isOllama = provider.name === 'ollama';
  const url = isOllama
    ? `${provider.baseUrl.replace(/\/$/, '')}/api/chat`
    : `${provider.baseUrl}/chat/completions`;

  const body = isOllama
    ? JSON.stringify({ model: provider.model, messages, stream: false })
    : JSON.stringify({ model: provider.model, messages, stream: false, temperature: 0.2 });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (provider.apiKey) headers['Authorization'] = `Bearer ${provider.apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const res = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
    if (!res.ok) throw new Error(`AI returned ${res.status}`);
    const data = await res.json() as Record<string, unknown>;

    if (isOllama) {
      return ((data as { message?: { content?: string } }).message?.content ?? '').trim();
    }
    const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices;
    return (choices?.[0]?.message?.content ?? '').trim();
  } finally {
    clearTimeout(timeout);
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { fileName } = (await req.json()) as { fileName?: string };
    if (!fileName) return NextResponse.json({ error: 'fileName is required' }, { status: 400 });

    const safe = path.basename(fileName);
    const filePath = path.join(DATA_DIR, safe);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'PDF not found. Upload it first.' }, { status: 404 });
    }

    const buffer = readFileSync(filePath);
    const pdfText = extractPdfText(buffer);
    if (!pdfText || pdfText.length < 20) {
      return NextResponse.json({ error: 'Could not extract text from this PDF. Try a text-based PDF.' }, { status: 422 });
    }

    const provider = await resolveProvider();
    const aiResponse = await callAI(provider, pdfText);

    // Parse the JSON array from the AI response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI did not return a valid product list. Check your AI configuration.', raw: aiResponse.slice(0, 500) }, { status: 422 });
    }

    const products = JSON.parse(jsonMatch[0]) as unknown[];
    return NextResponse.json({ products, provider: provider.name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
