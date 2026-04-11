import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/db";
import {
  generateSystemPrompt,
  generateUserPrompt,
  getAvailableImages,
} from "@/lib/ai/prompts";
import { decryptKey } from "@/lib/ai/encryption";
import { isBlockRegistered } from "@/lib/blocks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlockInput {
  type: string;
  data: Record<string, { Value: string }>;
  children?: BlockInput[];
}

type Provider = "ollama" | "gemini" | "deepseek" | "mistral";

interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
}

interface GenerationRequest {
  prompt: string;
  provider?: Provider;
  // Ollama
  ollamaUrl?: string;
  model?: string;
  // External API providers
  apiKey?: string;
  externalModel?: string;
  // Vision: raw base64 (no data: prefix)
  images?: string[];
  // PDF → products
  pdfFileName?: string;
  // Media context
  selectedMedia?: string;
  // Answers to clarifying questions (second-pass generation)
  questionAnswers?: Record<string, string>;
}

// ─── Cost estimation per 1M tokens (USD) ──────────────────────────────────────

function calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const lower = provider.toLowerCase();
  let rateIn = 0, rateOut = 0;
  switch (lower) {
    case "gemini": rateIn = 0.10; rateOut = 0.40; break;
    case "deepseek": rateIn = 0.27; rateOut = 1.10; break;
    case "mistral": rateIn = 0.10; rateOut = 0.30; break;
    default: rateIn = 0; rateOut = 0; // Ollama or unknown = free
  }
  return (inputTokens * rateIn + outputTokens * rateOut) / 1_000_000;
}

// ─── PDF text extraction (no external dependencies) ──────────────────────────

function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString("binary");
  const texts: string[] = [];

  const tjRegex = /\(([^)\\]|\\[\s\S])*\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = tjRegex.exec(content)) !== null) {
    const raw = m[0].slice(1, m[0].lastIndexOf(")"));
    const decoded = raw
      .replace(/\\n/g, " ")
      .replace(/\\r/g, "")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .trim();
    if (decoded.length > 1) texts.push(decoded);
  }

  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  while ((m = tjArrayRegex.exec(content)) !== null) {
    const arr = m[1];
    const parts = arr.match(/\(([^)\\]|\\[\s\S])*\)/g) || [];
    const combined = parts.map((p) => p.slice(1, -1)).join("").trim();
    if (combined.length > 1) texts.push(combined);
  }

  return texts.join(" ").replace(/\s{2,}/g, " ").trim().substring(0, 8000);
}

// ─── JSON extraction & repair ─────────────────────────────────────────────────

/** Removes trailing commas, JS comments, and other common LLM JSON mistakes. */
function repairJSON(str: string): string {
  return str
    .replace(/\/\/[^\n\r]*/g, "")           // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")        // multi-line comments
    .replace(/,(\s*[}\]])/g, "$1")           // trailing commas
    .replace(/(['"])?([a-zA-Z_$][a-zA-Z0-9_$]*)(['"])?\s*:/g, (_, q1, key, q3) => {
      // Ensure keys are quoted — only fix unquoted keys
      if (!q1 && !q3) return `"${key}":`;
      return `${q1 || '"'}${key}${q3 || '"'}:`;
    });
}

function extractJSON(raw: string): string | null {
  const candidates: string[] = [];

  // 1. Strip common markdown fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  candidates.push(raw.trim(), stripped);

  // 2. Find the outermost { ... } block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    candidates.push(raw.slice(start, end + 1));
  }

  // 3. Try each candidate — first plain, then repaired
  for (const candidate of candidates) {
    // plain
    try {
      JSON.parse(candidate);
      return candidate;
    } catch { /* */ }

    // repaired
    try {
      const repaired = repairJSON(candidate);
      JSON.parse(repaired);
      return repaired;
    } catch { /* */ }
  }

  return null;
}

// ─── AI provider callers ──────────────────────────────────────────────────────

async function callOllama(
  systemPrompt: string,
  userMessage: string,
  ollamaUrl: string,
  model: string,
  images?: string[],
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 90000); // 90s — local models should respond well within this

  const body: Record<string, unknown> = {
    model,
    prompt: userMessage,
    system: systemPrompt,
    stream: false,
    options: {
      temperature: 0.2,
      num_predict: 4096,
    },
  };

  if (images && images.length > 0) {
    body.images = images;    // Vision models (llama3.2-vision:11b, etc.)
  }

  console.log('[Ollama] Sending request to', `${ollamaUrl}/api/generate`, 'with model:', model);

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const err = await response.text();
    console.error('[Ollama] Error response:', response.status, err.substring(0, 200));
    throw new Error(`Ollama ${response.status}: ${err.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = (data.response as string) || "";
  console.log(`[Ollama] Response received: ${text.length} chars | First 200: ${text.substring(0, 200).replace(/\n/g, " ")}`);
  return text;
}

async function callGemini(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string,
  images?: string[],
): Promise<string> {
  const geminiModel = model || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const parts: unknown[] = [{ text: userMessage }];
  if (images?.length) {
    for (const imgBase64 of images) {
      const mimeType = imgBase64.startsWith("/9j") ? "image/jpeg" : "image/png";
      parts.push({ inlineData: { mimeType, data: imgBase64 } });
    }
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,  // Reducido para evitar tiempos largos
      responseMimeType: "application/json",  // Force JSON output
    },
  };

  const controller = new AbortController();
  // Timeout: 60 segundos para Gemini (más rápido que Ollama)
  const timeout = setTimeout(() => {
    console.log('[Gemini] Timeout triggered');
    controller.abort();
  }, 60000);

  console.log('[Gemini] Sending request with model:', geminiModel);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const err = await response.text();
    console.error('[Gemini] Error response:', response.status, err.substring(0, 300));
    throw new Error(`Gemini ${response.status}: ${err.substring(0, 300)}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";

  console.log(`[Gemini] Response received: ${text.length} chars`);
  return text;
}

async function callOpenAICompatible(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string,
  baseUrl: string,
  images?: string[],
): Promise<string> {
  let userContent: unknown;
  if (images?.length) {
    const contentParts: unknown[] = [{ type: "text", text: userMessage }];
    for (const imgBase64 of images) {
      const mimeType = imgBase64.startsWith("/9j") ? "image/jpeg" : "image/png";
      contentParts.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${imgBase64}` },
      });
    }
    userContent = contentParts;
  } else {
    userContent = userMessage;
  }

  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.2,
    max_tokens: 8192,  // Reducido para mejorar velocidad
    response_format: { type: "json_object" },  // Force JSON (OpenAI-compatible)
  };

  const controller = new AbortController();
  // Timeout: 60 segundos para APIs externas
  const timeout = setTimeout(() => {
    console.log(`[${baseUrl}] Timeout triggered`);
    controller.abort();
  }, 60000);

  console.log(`[${baseUrl}] Sending request with model:`, model);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const err = await response.text();
    console.error(`[${baseUrl}] Error response:`, response.status, err.substring(0, 300));
    throw new Error(`${baseUrl} ${response.status}: ${err.substring(0, 300)}`);
  }

  const data = await response.json();
  const text = (data?.choices?.[0]?.message?.content as string) ?? "";
  console.log(`[${baseUrl}] Response received: ${text.length} chars`);
  return text;
}

// ─── Slug uniqueness ─────────────────────────────────────────────────────────

async function ensureUniqueSlug(base: string): Promise<string> {
  const clean = base.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  let slug = clean;
  let i = 1;
  while (await prisma.page.findUnique({ where: { slug } })) {
    slug = `${clean}-${i++}`;
  }
  return slug;
}

// ─── Block validation — filter unknown types recursively ─────────────────────

interface FilterResult {
  blocks: BlockInput[];
  removed: string[];
}

function filterUnknownBlocks(blocks: BlockInput[]): FilterResult {
  const removed: string[] = [];

  const clean = (list: BlockInput[]): BlockInput[] =>
    list.flatMap((b) => {
      if (!isBlockRegistered(b.type)) {
        removed.push(b.type);
        // Try to salvage children of unknown containers
        return b.children ? clean(b.children) : [];
      }
      return [{ ...b, children: b.children ? clean(b.children) : undefined }];
    });

  return { blocks: clean(blocks), removed };
}

// ─── Auto-create products for ProductCardBlocks that have Name/Price but no ProductId ──

async function autoLinkProducts(blocks: BlockInput[]): Promise<void> {
  for (const block of blocks) {
    if (block.type === "ProductCardBlock") {
      const productId = block.data?.ProductId?.Value?.trim();
      const name = block.data?.Name?.Value?.trim();
      const price = block.data?.Price?.Value?.trim();
      if (!productId && name && price) {
        try {
          const product = await prisma.product.create({
            data: {
              name,
              description: block.data?.Description?.Value?.trim() || "",
              price: parseFloat(price) || 0,
              stock: parseInt(block.data?.Stock?.Value || "999") || 999,
              imageUrl: block.data?.Image?.Value?.trim() || null,
            },
          });
          block.data.ProductId = { Value: product.id };
          console.log(`[AI] Auto-created product "${name}" → ${product.id}`);
        } catch (e) {
          console.warn(`[AI] Failed to auto-create product "${name}":`, e);
        }
      }
    }
    if (block.children?.length) await autoLinkProducts(block.children);
  }
}

// ─── Block persistence ────────────────────────────────────────────────────────

async function createBlocksRecursive(
  pageId: string,
  blocks: BlockInput[],
  parentId: string | null = null,
): Promise<void> {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const created = await prisma.block.create({
      data: {
        type: b.type,
        jsonData: JSON.stringify(b.data),
        sortOrder: i,
        pageId,
        parentId,
      },
    });
    if (b.children?.length) {
      await createBlocksRecursive(pageId, b.children, created.id);
    }
  }
}

// ─── Main POST handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: GenerationRequest = await req.json();
    const {
      prompt,
      provider = "ollama",
      ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434",
      model = process.env.OLLAMA_MODEL || "llama3.2-vision:11b",
      externalModel,
      images,
      pdfFileName,
      selectedMedia,
    } = body;

    let { apiKey } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "A prompt is required" }, { status: 400 });
    }

    // ── If no apiKey sent, try to load saved encrypted key from DB ──────────
    if (provider !== "ollama" && !apiKey) {
      try {
        const saved = await prisma.apiKey.findUnique({ where: { provider } });
        if (saved) {
          apiKey = decryptKey(saved.encryptedKey, saved.iv, saved.authTag);
        }
      } catch {
        // No saved key, will fail validation below
      }
    }

    if (provider !== "ollama" && !apiKey) {
      return NextResponse.json(
        { success: false, error: `No API key for ${provider}. Save one in the settings.` },
        { status: 400 },
      );
    }

    // ── Gather media images ──────────────────────────────────────────────────
    const availableImages = getAvailableImages();

    // ── PDF text extraction ──────────────────────────────────────────────────
    let pdfProductData: string | null = null;
    if (pdfFileName) {
      const safeName = pdfFileName.replace(/[^a-zA-Z0-9._-]/g, "");
      try {
        const pdfBuffer = readFileSync(join(process.cwd(), "public", "data", safeName));
        pdfProductData = extractPdfText(pdfBuffer);
        console.log(`[AI] PDF extracted: ${pdfProductData.length} chars from "${safeName}"`);
      } catch (e) {
        console.warn(`[AI] Could not read PDF "${safeName}":`, e);
      }
    }

    // ── Build prompts ────────────────────────────────────────────────────────
    console.log('[AI] Building prompts with', availableImages.length, 'available images');
    const systemPrompt = generateSystemPrompt(availableImages, pdfProductData);
    console.log('[AI] System prompt length:', systemPrompt.length, 'chars');
    const userPrompt = generateUserPrompt(prompt, selectedMedia, !!images?.length, !!pdfProductData, body.questionAnswers);
    console.log('[AI] User prompt length:', userPrompt.length, 'chars');

    // ── Call AI provider ─────────────────────────────────────────────────────
    console.log('[AI] Calling provider:', provider);
    let rawResponse: string;

    switch (provider) {
      case "ollama":
        rawResponse = await callOllama(systemPrompt, userPrompt, ollamaUrl, model, images);
        break;
      case "gemini":
        rawResponse = await callGemini(systemPrompt, userPrompt, apiKey!, externalModel || "gemini-2.5-flash-lite", images);
        break;
      case "deepseek":
        rawResponse = await callOpenAICompatible(systemPrompt, userPrompt, apiKey!, externalModel || "deepseek-chat", "https://api.deepseek.com/v1", images);
        break;
      case "mistral":
        rawResponse = await callOpenAICompatible(systemPrompt, userPrompt, apiKey!, externalModel || "mistral-large-latest", "https://api.mistral.ai/v1", images);
        break;
      default:
        return NextResponse.json({ success: false, error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    // ── Extract & validate JSON ───────────────────────────────────────────────
    const jsonStr = extractJSON(rawResponse);
    if (!jsonStr) {
      const preview = rawResponse.substring(0, 300).replace(/\n/g, " ");
      console.error(`[AI] JSON extraction failed. Response preview: "${preview}"`);
      return NextResponse.json(
        {
          success: false,
          error: `The model did not return valid JSON. Preview: "${preview.substring(0, 150)}..."`,
        },
        { status: 400 },
      );
    }

    let parsed: { title?: string; slug?: string; blocks?: BlockInput[]; questions?: ClarifyingQuestion[] };
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `Invalid JSON after repair: ${e instanceof Error ? e.message : e}` },
        { status: 400 },
      );
    }

    // ── Questions mode — AI needs more info before building the page ──────────
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      console.log(`[AI] Questions mode — ${parsed.questions.length} questions returned`);
      return NextResponse.json({ success: true, mode: "questions", questions: parsed.questions });
    }

    const pageData = parsed as { title: string; slug: string; blocks: BlockInput[] };
    if (!pageData.title || !pageData.slug) {
      return NextResponse.json(
        { success: false, error: "Response does not include required title and slug" },
        { status: 400 },
      );
    }

    // ── Validate & filter unknown block types ────────────────────────────────
    const rawBlocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
    const { blocks: validBlocks, removed } = filterUnknownBlocks(rawBlocks);

    if (removed.length > 0) {
      console.warn(`[AI] Removed unknown block types: ${[...new Set(removed)].join(", ")}`);
    }

    // Reject empty pages — never create a page with no blocks
    if (validBlocks.length === 0) {
      const reason = rawBlocks.length === 0
        ? "The AI returned no blocks. Try rephrasing your request with more detail."
        : `The AI used invalid block types (${[...new Set(removed)].join(", ")}). Try again or use a more capable model.`;
      console.error(`[AI] Rejected empty page — ${reason}`);
      return NextResponse.json({ success: false, error: reason }, { status: 400 });
    }

    // ── Auto-create products for ProductCardBlocks ────────────────────────────
    await autoLinkProducts(validBlocks);

    // ── Persist page as DRAFT ────────────────────────────────────────────────
    const maxOrder = await prisma.page.aggregate({ _max: { sortOrder: true } });

    const slug = await ensureUniqueSlug(pageData.slug || pageData.title);

    const page = await prisma.page.create({
      data: {
        title: pageData.title,
        slug,
        pageType: "ai-generated",
        isPublished: false,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    if (validBlocks.length > 0) {
      await createBlocksRecursive(page.id, validBlocks);
    }

    // Log AI usage (token estimation - actual counts not available from all providers)
    try {
      const inputChars = systemPrompt.length + userPrompt.length;
      const outputChars = rawResponse.length;
      const inputTokens = Math.round(inputChars / 4);
      const outputTokens = Math.round(outputChars / 4);
      const cost = calculateCost(provider, inputTokens, outputTokens);

      await prisma.aiUsageLog.create({
        data: {
          provider,
          operation: 'Generate',
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
          model: model || null,
        },
      });
    } catch (logErr) {
      console.error('[AI] Failed to log usage:', logErr);
    }

    return NextResponse.json(
      {
        success: true,
        page: { id: page.id, title: page.title, slug: page.slug, blocks: validBlocks },
        ...(removed.length > 0 && {
          warning: `Unknown blocks removed: ${[...new Set(removed)].join(", ")}`,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI] Generation error:", error);
    if (message.includes("abort") || message.includes("Abort")) {
      return NextResponse.json(
        { success: false, error: "Timeout — the model took too long. Use a faster model." },
        { status: 504 },
      );
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
