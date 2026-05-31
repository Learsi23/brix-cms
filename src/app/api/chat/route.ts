// /api/chat — AI chat with streaming (SSE)
// Provider priority: Gemini (if key + provider set) → Ollama (local fallback)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// ── SSE helpers ───────────────────────────────────────────────────────────────

function sseHeaders(): HeadersInit {
  return {
    'Content-Type':      'text/event-stream',
    'Cache-Control':     'no-cache, no-transform',
    'Connection':        'keep-alive',
    'X-Accel-Buffering': 'no',
  };
}

function encodeToken(token: string)   { return new TextEncoder().encode(`data: ${JSON.stringify({ token })}\n\n`); }
function encodeDone()                  { return new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`); }
function encodeError(msg: string)     { return new TextEncoder().encode(`data: ${JSON.stringify({ error: msg })}\n\n`); }

// ── Config loader ─────────────────────────────────────────────────────────────

interface ChatConfig {
  provider:    'ollama' | 'gemini';
  ollamaUrl:   string;
  ollamaModel: string;
  geminiKey:   string;
  geminiModel: string;
}

async function loadConfig(): Promise<ChatConfig> {
  const defaults: ChatConfig = {
    provider:    'ollama',
    ollamaUrl:   process.env.OLLAMA_URL   ?? 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.2',
    geminiKey:   process.env.GEMINI_API_KEY ?? '',
    geminiModel: 'gemini-2.5-flash-lite',
  };

  try {
    const rows = await prisma.siteConfig.findMany({
      where: { key: { in: ['ollama_url', 'ollama_model', 'ai_provider', 'gemini_api_key', 'gemini_model'] } },
    });
    const cfg: Record<string, string> = {};
    for (const r of rows) cfg[r.key] = r.value;

    return {
      provider:    (cfg.ai_provider as 'ollama' | 'gemini') ?? defaults.provider,
      ollamaUrl:   cfg.ollama_url   ?? defaults.ollamaUrl,
      ollamaModel: cfg.ollama_model ?? defaults.ollamaModel,
      geminiKey:   cfg.gemini_api_key ?? defaults.geminiKey,
      geminiModel: cfg.gemini_model   ?? defaults.geminiModel,
    };
  } catch {
    return defaults;
  }
}

// ── Ollama streaming ──────────────────────────────────────────────────────────

async function streamOllama(
  controller: ReadableStreamDefaultController,
  msgs: { role: string; content: string }[],
  cfg: ChatConfig,
) {
  let res: Response;
  try {
    res = await fetch(`${cfg.ollamaUrl}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model: cfg.ollamaModel, messages: msgs, stream: true }),
    });
  } catch {
    controller.enqueue(encodeError(`Cannot connect to Ollama at ${cfg.ollamaUrl}. Is it running?`));
    controller.enqueue(encodeDone());
    controller.close();
    return;
  }

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => '');
    controller.enqueue(encodeError(`Ollama error: ${txt || res.status}`));
    controller.enqueue(encodeDone());
    controller.close();
    return;
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

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
          const json = JSON.parse(trimmed);
          const token: string = json.message?.content ?? '';
          if (token) controller.enqueue(encodeToken(token));
          if (json.done) {
            controller.enqueue(encodeDone());
            controller.close();
            return;
          }
        } catch { /* skip malformed lines */ }
      }
    }
  } catch {
    controller.enqueue(encodeError('Ollama stream interrupted'));
  } finally {
    controller.close();
    reader.releaseLock();
  }
}

// ── Gemini streaming (OpenAI-compatible endpoint) ─────────────────────────────

async function streamGemini(
  controller: ReadableStreamDefaultController,
  msgs: { role: string; content: string }[],
  cfg: ChatConfig,
) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.geminiKey}`,
      },
      body: JSON.stringify({
        model:       cfg.geminiModel,
        messages:    msgs,
        stream:      true,
        temperature: 0.7,
        max_tokens:  2048,
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    controller.enqueue(encodeError(`Gemini connection error: ${msg}`));
    controller.enqueue(encodeDone());
    controller.close();
    return;
  }

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => '');
    controller.enqueue(encodeError(`Gemini error ${res.status}: ${txt.slice(0, 200)}`));
    controller.enqueue(encodeDone());
    controller.close();
    return;
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

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

        const payload = trimmed.slice(6).trim();
        if (payload === '[DONE]') {
          controller.enqueue(encodeDone());
          controller.close();
          return;
        }

        try {
          const json = JSON.parse(payload);
          const token: string = json.choices?.[0]?.delta?.content ?? '';
          if (token) controller.enqueue(encodeToken(token));
        } catch { /* skip partial lines */ }
      }
    }
  } catch {
    controller.enqueue(encodeError('Gemini stream interrupted'));
  } finally {
    controller.close();
    reader.releaseLock();
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, messages: history = [], systemPrompt } = body;

    const cfg = await loadConfig();

    const sysContent: string =
      systemPrompt ||
      'You are a helpful assistant for this website. Be friendly, concise and helpful. ' +
      'Respond in the same language the user writes in.';

    const msgs: { role: string; content: string }[] = [
      { role: 'system', content: sysContent },
      ...history,
      ...(message ? [{ role: 'user', content: message }] : []),
    ];

    // Resolve effective provider — fall back to Ollama if Gemini key is missing
    const useGemini = cfg.provider === 'gemini' && cfg.geminiKey.length > 0;

    const stream = new ReadableStream({
      async start(controller) {
        if (useGemini) {
          await streamGemini(controller, msgs, cfg);
        } else {
          await streamOllama(controller, msgs, cfg);
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `data: ${JSON.stringify({ error: msg })}\n\n`,
      { status: 200, headers: sseHeaders() },
    );
  }
}
