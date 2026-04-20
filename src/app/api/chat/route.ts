// /api/chat — Production streaming chat API
// Matches EdenCMS.Web.Pro ChatBlock behaviour: provider resolution, PDF/product context, SSE streaming.
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptKey } from '@/lib/ai/encryption';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: Role;
  content: string;
}

interface ChatRequest {
  messages: Array<{ role: Role; content: string }>;
  customPrompt?: string;
  pdfFilter?: string;
  aiProvider?: string;
}

type NamedProvider = 'ollama' | 'gemini' | 'deepseek' | 'mistral';

interface ProviderConfig {
  name: NamedProvider;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

// ─── SSE helpers ──────────────────────────────────────────────────────────────

function sseHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  };
}

function encodeChunk(text: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`);
}

function encodeDone(): Uint8Array {
  return new TextEncoder().encode('data: [DONE]\n\n');
}

function encodeError(message: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ error: message })}\n\n`);
}

// ─── PDF extraction (no external deps) ───────────────────────────────────────

function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const texts: string[] = [];

  // (text)Tj pattern
  const tjRegex = /\(([^)\\]|\\[\s\S])*\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = tjRegex.exec(content)) !== null) {
    const raw = m[0].slice(1, m[0].lastIndexOf(')'));
    const decoded = raw
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, '')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .trim();
    if (decoded.length > 1) texts.push(decoded);
  }

  // [...]TJ pattern
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  while ((m = tjArrayRegex.exec(content)) !== null) {
    const arr = m[1];
    const parts = arr.match(/\(([^)\\]|\\[\s\S])*\)/g) ?? [];
    const combined = parts.map((p) => p.slice(1, -1)).join('').trim();
    if (combined.length > 1) texts.push(combined);
  }

  return texts.join(' ').replace(/\s{2,}/g, ' ').trim();
}

function searchPdfs(query: string, pdfFilter?: string): string {
  const dataDir = join(process.cwd(), 'public', 'data');
  if (!existsSync(dataDir)) return '';

  let files: string[];
  try {
    files = readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  } catch {
    return '';
  }

  if (pdfFilter) {
    files = files.filter((f) => f.toLowerCase().includes(pdfFilter.toLowerCase()));
  }

  if (files.length === 0) return '';

  // Tokenise the query into meaningful keywords (ignore very short words)
  const keywords = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  if (keywords.length === 0) return '';

  const results: string[] = [];

  for (const file of files) {
    try {
      const buffer = readFileSync(join(dataDir, file));
      const text = extractPdfText(buffer);
      if (!text) continue;

      // Split into sentences (rough approximation)
      const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15);

      // Score sentences by keyword matches
      const scored = sentences.map((sentence) => {
        const lower = sentence.toLowerCase();
        const hits = keywords.filter((kw) => lower.includes(kw)).length;
        return { sentence, hits };
      });

      const matched = scored
        .filter((s) => s.hits > 0)
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 5)
        .map((s) => s.sentence);

      if (matched.length > 0) {
        results.push(`[Document: ${file}]\n${matched.join(' ')}`);
      }
    } catch {
      // Skip unreadable files silently
    }
  }

  return results.slice(0, 5).join('\n\n');
}

// ─── Product search ───────────────────────────────────────────────────────────

const GENERIC_GREETINGS = new Set([
  'hi', 'hello', 'hey', 'hola', 'hej', 'ciao', 'bonjour', 'ola', 'yo', 'sup',
]);

function isShortOrGeneric(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length < 4) return true;
  // Single-word generic greetings
  if (/^\w+$/.test(trimmed) && GENERIC_GREETINGS.has(trimmed)) return true;
  return false;
}

async function searchProducts(query: string): Promise<string> {
  if (isShortOrGeneric(query)) return '';

  try {
    const all = await prisma.product.findMany({
      take: 20,
      orderBy: { name: 'asc' },
      select: {
        name: true,
        description: true,
        price: true,
        stock: true,
        categoryName: true,
        currencySymbol: true,
      },
    });

    const keywords = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);

    const filtered =
      keywords.length > 0
        ? all.filter((p) => {
            const haystack = `${p.name} ${p.description ?? ''}`.toLowerCase();
            return keywords.some((kw) => haystack.includes(kw));
          })
        : all;

    if (filtered.length === 0) return '';

    return filtered
      .map((p) => {
        const currency = p.currencySymbol ?? '€';
        const category = p.categoryName ?? 'N/A';
        const desc = p.description ? ` | Description: ${p.description.slice(0, 120)}` : '';
        return `[Product] ${p.name} | Price: ${currency}${p.price.toFixed(2)} | In stock: ${p.stock} | Category: ${category}${desc}`;
      })
      .join('\n');
  } catch {
    return '';
  }
}

// ─── System prompt assembly ───────────────────────────────────────────────────

function buildSystemPrompt(
  customPrompt: string | undefined,
  pdfContext: string,
  productContext: string,
): string {
  const parts: string[] = [
    'You are a professional and friendly assistant for this website.',
  ];

  if (customPrompt?.trim()) {
    parts.push(customPrompt.trim());
  }

  const hasContext = pdfContext.length > 0 || productContext.length > 0;
  if (hasContext) {
    parts.push('');
    parts.push('── TOOLS (context from knowledge base) ──────────────────────────────────');
    if (pdfContext) parts.push(pdfContext);
    if (productContext) parts.push(productContext);
    parts.push('─────────────────────────────────────────────────────────────────────────');
  }

  return parts.join('\n');
}

// ─── Provider resolution ──────────────────────────────────────────────────────

async function resolveProvider(aiProvider: string | undefined): Promise<ProviderConfig> {
  // Load Ollama settings from DB
  async function getOllamaConfig(): Promise<ProviderConfig> {
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
      return {
        name: 'ollama',
        baseUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL ?? 'llama3',
      };
    }
  }

  const EXTERNAL_PROVIDERS: { name: NamedProvider; baseUrl: string; model: string }[] = [
    { name: 'gemini',   baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash-lite' },
    { name: 'deepseek', baseUrl: 'https://api.deepseek.com',                                model: 'deepseek-chat' },
    { name: 'mistral',  baseUrl: 'https://api.mistral.ai/v1',                               model: 'mistral-small-2503' },
  ];

  async function loadApiKey(provider: NamedProvider): Promise<string | null> {
    try {
      const row = await prisma.apiKey.findUnique({ where: { provider } });
      if (!row) return null;
      return decryptKey(row.encryptedKey, row.iv, row.authTag);
    } catch {
      return null;
    }
  }

  const normalized = aiProvider?.toLowerCase().trim() ?? 'auto';

  // Explicit Ollama
  if (normalized === 'ollama') {
    return getOllamaConfig();
  }

  // Explicit named external provider
  const explicitExternal = EXTERNAL_PROVIDERS.find((p) => p.name === normalized);
  if (explicitExternal) {
    const apiKey = await loadApiKey(explicitExternal.name);
    if (!apiKey) {
      // Fallback to Ollama if no key saved
      return getOllamaConfig();
    }
    return { ...explicitExternal, apiKey };
  }

  // 'auto' or missing — find first external provider with a saved key
  for (const p of EXTERNAL_PROVIDERS) {
    const apiKey = await loadApiKey(p.name);
    if (apiKey) {
      return { ...p, apiKey };
    }
  }

  // Ultimate fallback: Ollama
  return getOllamaConfig();
}

// ─── Cost helpers ─────────────────────────────────────────────────────────────

function calculateChatCost(provider: string, inputTokens: number, outputTokens: number): number {
  switch (provider.toLowerCase()) {
    case 'gemini':   return (inputTokens * 0.10 + outputTokens * 0.40) / 1_000_000;
    case 'deepseek': return (inputTokens * 0.27 + outputTokens * 1.10) / 1_000_000;
    case 'mistral':  return (inputTokens * 0.10 + outputTokens * 0.30) / 1_000_000;
    default:         return 0; // Ollama = free
  }
}

// ─── Streaming callers ────────────────────────────────────────────────────────

interface StreamResult {
  inputTokens: number;
  outputTokens: number;
}

async function streamOllama(
  controller: ReadableStreamDefaultController,
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<StreamResult> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/api/chat`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: true,
        options: { temperature: 0.7 },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const friendly =
      msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('connect')
        ? `Could not connect to Ollama at ${config.baseUrl}. Make sure Ollama is running.`
        : `Ollama connection error: ${msg}`;
    controller.enqueue(encodeError(friendly));
    controller.enqueue(encodeDone());
    controller.close();
    return { inputTokens: 0, outputTokens: 0 };
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    controller.enqueue(encodeError(`Ollama returned ${response.status}: ${body.slice(0, 200)}`));
    controller.enqueue(encodeDone());
    controller.close();
    return { inputTokens: 0, outputTokens: 0 };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    controller.enqueue(encodeError('Ollama returned no response body.'));
    controller.enqueue(encodeDone());
    controller.close();
    return { inputTokens: 0, outputTokens: 0 };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed) as {
            message?: { content?: string };
            done?: boolean;
            prompt_eval_count?: number;
            eval_count?: number;
          };
          const token = parsed.message?.content ?? '';
          if (token) controller.enqueue(encodeChunk(token));
          if (parsed.done) {
            // Ollama provides actual token counts in the final message
            inputTokens = parsed.prompt_eval_count ?? 0;
            outputTokens = parsed.eval_count ?? 0;
            controller.enqueue(encodeDone());
            controller.close();
            return { inputTokens, outputTokens };
          }
        } catch {
          // Malformed line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  controller.enqueue(encodeDone());
  controller.close();
  return { inputTokens, outputTokens };
}

async function streamOpenAICompatible(
  controller: ReadableStreamDefaultController,
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<StreamResult> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const inputChars = messages.reduce((sum, m) => sum + m.content.length, 0);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
        stream_options: { include_usage: true },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    controller.enqueue(encodeError(`${config.name} connection error: ${msg}`));
    controller.enqueue(encodeDone());
    controller.close();
    return { inputTokens: 0, outputTokens: 0 };
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    controller.enqueue(
      encodeError(`${config.name} returned ${response.status}: ${body.slice(0, 200)}`),
    );
    controller.enqueue(encodeDone());
    controller.close();
    return { inputTokens: 0, outputTokens: 0 };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    controller.enqueue(encodeError(`${config.name} returned no response body.`));
    controller.enqueue(encodeDone());
    controller.close();
    return { inputTokens: 0, outputTokens: 0 };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let outputChars = 0;
  let inputTokens = Math.round(inputChars / 4);
  let outputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const payload = trimmed.slice(6).trim(); // strip "data: "
        if (payload === '[DONE]') {
          controller.enqueue(encodeDone());
          controller.close();
          outputTokens = outputTokens || Math.round(outputChars / 4);
          return { inputTokens, outputTokens };
        }

        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
          const token = parsed.choices?.[0]?.delta?.content ?? '';
          if (token) {
            outputChars += token.length;
            controller.enqueue(encodeChunk(token));
          }
          // Final chunk with usage (stream_options: include_usage)
          if (parsed.usage?.prompt_tokens) {
            inputTokens = parsed.usage.prompt_tokens;
            outputTokens = parsed.usage.completion_tokens ?? Math.round(outputChars / 4);
          }
        } catch {
          // Partial or malformed SSE line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  controller.enqueue(encodeDone());
  controller.close();
  outputTokens = outputTokens || Math.round(outputChars / 4);
  return { inputTokens, outputTokens };
}

// ─── Main POST handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encodeError('Invalid JSON in request body.'));
        controller.enqueue(encodeDone());
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders() });
  }

  const { messages = [], customPrompt, pdfFilter, aiProvider } = body;

  // Filter out any system messages from the client; normalise role types
  const history: ChatMessage[] = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));

  // Derive the last user message for context enrichment
  const lastUserMessage =
    [...history].reverse().find((m) => m.role === 'user')?.content ?? '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── Context enrichment (run in parallel) ──────────────────────────────
        const [pdfContext, productContext, providerConfig] = await Promise.all([
          Promise.resolve().then(() => searchPdfs(lastUserMessage, pdfFilter)).catch(() => ''),
          searchProducts(lastUserMessage).catch(() => ''),
          resolveProvider(aiProvider).catch(() => ({
            name: 'ollama' as NamedProvider,
            baseUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
            model: process.env.OLLAMA_MODEL ?? 'llama3',
          })),
        ]);

        // ── Build full message list with injected system prompt ───────────────
        const systemPrompt = buildSystemPrompt(customPrompt, pdfContext, productContext);
        const fullMessages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...history,
        ];

        // ── Dispatch to provider ──────────────────────────────────────────────
        let streamResult: StreamResult;
        if (providerConfig.name === 'ollama') {
          streamResult = await streamOllama(controller, providerConfig, fullMessages);
        } else {
          streamResult = await streamOpenAICompatible(controller, providerConfig, fullMessages);
        }

        // ── Log usage (fire and forget — stream is already closed) ────────────
        const { inputTokens, outputTokens } = streamResult;
        if (inputTokens > 0 || outputTokens > 0) {
          const cost = calculateChatCost(providerConfig.name, inputTokens, outputTokens);
          prisma.aiUsageLog.create({
            data: {
              provider: providerConfig.name,
              operation: 'Chat',
              inputTokens,
              outputTokens,
              totalTokens: inputTokens + outputTokens,
              cost,
              model: providerConfig.model || null,
            },
          }).catch((e: unknown) => console.error('[Chat] Failed to log usage:', e));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected server error.';
        try {
          controller.enqueue(encodeError(message));
          controller.enqueue(encodeDone());
          controller.close();
        } catch {
          // Controller already closed
        }
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
