/**
 * POST /api/figma/export
 *
 * Exports selected Figma frames as PNG images (2× scale) and returns them
 * as base64 strings ready to pass directly to /api/ai/generate-page.
 *
 * Body:
 *   { fileKey: string, frames: Array<{ id: string; name: string }> }
 *
 * Response:
 *   { frames: Array<{ id: string; name: string; base64: string }> }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptKey } from "@/lib/ai/encryption";

const FIGMA_API = "https://api.figma.com/v1";
const EXPORT_SCALE = 2;          // 2× for sharp AI vision
const MAX_FRAMES = 8;            // safety cap — avoids rate limits
const FIGMA_TIMEOUT = 30_000;    // 30s per Figma call

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getFigmaToken(): Promise<string> {
  const saved = await prisma.apiKey.findUnique({ where: { provider: "figma" } });
  if (!saved) throw new Error("No Figma token saved. Go to Configuration → API Keys.");
  return decryptKey(saved.encryptedKey, saved.iv, saved.authTag);
}

/** Fetch with timeout + Authorization header */
async function figmaFetch(url: string, pat: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FIGMA_TIMEOUT);
  const res = await fetch(url, {
    headers: { "X-Figma-Token": pat },
    signal: ctrl.signal,
  });
  clearTimeout(timer);
  return res;
}

/** Download a URL and convert to base64 (strips the data:... prefix) */
async function urlToBase64(imageUrl: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  const res = await fetch(imageUrl, { signal: ctrl.signal });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${imageUrl.substring(0, 80)}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString("base64");
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileKey, frames } = body as {
      fileKey: string;
      frames: Array<{ id: string; name: string }>;
    };

    if (!fileKey?.trim()) {
      return NextResponse.json({ error: "fileKey is required" }, { status: 400 });
    }
    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "frames array is required" }, { status: 400 });
    }

    const capped = frames.slice(0, MAX_FRAMES);
    const pat = await getFigmaToken();

    // ── Step 1: Get export URLs from Figma Images API ────────────────
    // Batch all node IDs in a single request to avoid rate limits
    const ids = capped.map((f) => f.id).join(",");
    const exportUrl =
      `${FIGMA_API}/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=${EXPORT_SCALE}`;

    console.log(`[Figma] Requesting export for ${capped.length} frames from file ${fileKey}`);
    const exportRes = await figmaFetch(exportUrl, pat);

    if (!exportRes.ok) {
      const txt = await exportRes.text();
      if (exportRes.status === 401 || exportRes.status === 403) {
        return NextResponse.json(
          { error: "Figma token invalid or expired. Regenerate it with scope file_content:read." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: `Figma export API error ${exportRes.status}: ${txt.substring(0, 200)}` },
        { status: 502 },
      );
    }

    const exportData: { images: Record<string, string | null>; err?: string } =
      await exportRes.json();

    if (exportData.err) {
      return NextResponse.json(
        { error: `Figma returned an error: ${exportData.err}` },
        { status: 502 },
      );
    }

    // ── Step 2: Download each image and convert to base64 ────────────
    const results: Array<{ id: string; name: string; base64: string }> = [];

    for (const frame of capped) {
      const imageUrl = exportData.images?.[frame.id];
      if (!imageUrl) {
        console.warn(`[Figma] No image URL returned for frame ${frame.id} (${frame.name}) — skipping`);
        continue;
      }
      try {
        console.log(`[Figma] Downloading frame "${frame.name}" (${frame.id})`);
        const base64 = await urlToBase64(imageUrl);
        results.push({ id: frame.id, name: frame.name, base64 });
        console.log(`[Figma] Frame "${frame.name}" → ${Math.round(base64.length / 1024)}KB base64`);
      } catch (dlErr) {
        console.warn(`[Figma] Download failed for "${frame.name}":`, dlErr);
        // Skip this frame rather than failing the whole request
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Could not export any frames. The frames may be empty or invisible." },
        { status: 422 },
      );
    }

    return NextResponse.json({ frames: results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.toLowerCase().includes("abort")) {
      return NextResponse.json(
        { error: "Request to Figma timed out. Try fewer frames." },
        { status: 504 },
      );
    }
    console.error("[Figma export]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
