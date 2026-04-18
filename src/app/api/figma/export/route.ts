/**
 * POST /api/figma/export
 *
 * Exports selected Figma frames as PNG images (2× scale), saves them to disk,
 * extracts image fills per frame and saves them to per-frame subfolders.
 *
 * Body:
 *   {
 *     fileKey:  string,
 *     fileName: string,                              // Figma file name → project slug
 *     frames:   Array<{ id: string; name: string; pageName: string }>
 *   }
 *
 * Response:
 *   {
 *     frames:         Array<{ id, name, base64, localPath, assetUrls }>,
 *     projectSlug:    string,
 *     canvasSlug:     string,
 *     perFrameAssets: Record<frameName, string[]>   // frameName → public asset URLs
 *   }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptKey } from "@/lib/ai/encryption";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const FIGMA_API    = "https://api.figma.com/v1";
const EXPORT_SCALE = 2;          // 2× for sharp AI vision
const MAX_FRAMES   = 8;          // safety cap — avoids rate limits
const FIGMA_TIMEOUT = 30_000;    // 30 s per Figma call
const UPLOADS_DIR   = path.join(process.cwd(), "public", "uploads");

// ── Types ─────────────────────────────────────────────────────────────────────

interface FigmaFill {
  type: string;
  imageRef?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  fills?: FigmaFill[];
  children?: FigmaNode[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getFigmaToken(): Promise<string> {
  const saved = await prisma.apiKey.findUnique({ where: { provider: "figma" } });
  if (!saved) throw new Error("No Figma token saved. Go to Configuration → API Keys.");
  return decryptKey(saved.encryptedKey, saved.iv, saved.authTag);
}

/** Fetch with timeout + Authorization header */
async function figmaFetch(url: string, pat: string): Promise<Response> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FIGMA_TIMEOUT);
  const res   = await fetch(url, { headers: { "X-Figma-Token": pat }, signal: ctrl.signal });
  clearTimeout(timer);
  return res;
}

/** Download a URL and return as Buffer */
async function downloadBuffer(imageUrl: string): Promise<Buffer> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);
  const res   = await fetch(imageUrl, { signal: ctrl.signal });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${imageUrl.substring(0, 80)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Recursively collect all IMAGE fill imageRefs from a Figma node tree */
function collectImageFills(node: FigmaNode, refs: string[]): void {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === "IMAGE" && fill.imageRef && !refs.includes(fill.imageRef)) {
        refs.push(fill.imageRef);
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      collectImageFills(child, refs);
    }
  }
}

/** Slugify: lowercase, replace non-alnum with hyphens, collapse & trim */
function slug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Derive frame slug (strip page- / section- prefix) */
function frameImgSlug(name: string): string {
  if (name.toLowerCase().startsWith("page-"))    return slug(name.slice("page-".length).trim());
  if (name.toLowerCase().startsWith("section-")) return slug(name.slice("section-".length).trim());
  return slug(name);
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileKey, fileName, frames } = body as {
      fileKey:  string;
      fileName?: string;
      frames: Array<{ id: string; name: string; pageName?: string }>;
    };

    if (!fileKey?.trim()) {
      return NextResponse.json({ error: "fileKey is required" }, { status: 400 });
    }
    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "frames array is required" }, { status: 400 });
    }

    const capped = frames.slice(0, MAX_FRAMES);
    const pat    = await getFigmaToken();

    // Derive slugs for the folder structure:
    // uploads/figma/{projectSlug}/{canvasSlug}/{frameSlug}/images/
    const projectSlug = slug(fileName || fileKey);
    const canvasSlug  = slug(capped[0]?.pageName || "canvas");
    const baseDir     = path.join(UPLOADS_DIR, "figma", projectSlug, canvasSlug);
    const baseUrl     = `/uploads/figma/${projectSlug}/${canvasSlug}`;

    // ── Step 1: Get export URLs from Figma Images API ────────────────────────
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

    // ── Step 2: Get node documents to collect image fills ────────────────────
    // We need depth=10 to walk nested groups/components
    const nodeIds = capped.map((f) => f.id).join(",");
    let perFrameRefs: Record<string, string[]> = {};  // frameName → [imageRef, ...]

    try {
      const nodesRes = await figmaFetch(
        `${FIGMA_API}/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeIds)}&depth=10`,
        pat,
      );
      if (nodesRes.ok) {
        const nodesData: { nodes: Record<string, { document: FigmaNode }> } =
          await nodesRes.json();

        for (const frame of capped) {
          const nodeEntry = nodesData.nodes?.[frame.id];
          if (!nodeEntry?.document) continue;
          const refs: string[] = [];
          collectImageFills(nodeEntry.document, refs);
          if (refs.length > 0) {
            perFrameRefs[frame.name] = refs;
          }
        }
        console.log(`[Figma] Found image fills in ${Object.keys(perFrameRefs).length} frames`);
      } else {
        console.warn(`[Figma] Nodes API returned ${nodesRes.status} — skipping fill extraction`);
      }
    } catch (nodesErr) {
      console.warn("[Figma] Nodes API error:", nodesErr);
    }

    // ── Step 3: Resolve all imageRefs to download URLs ───────────────────────
    let imageRefMap: Record<string, string> = {};  // imageRef → CDN URL

    const allRefs = [...new Set(Object.values(perFrameRefs).flat())];
    if (allRefs.length > 0) {
      try {
        const imagesRes = await figmaFetch(`${FIGMA_API}/files/${fileKey}/images`, pat);
        if (imagesRes.ok) {
          const imagesData: { meta?: { images?: Record<string, string> } } =
            await imagesRes.json();
          imageRefMap = imagesData?.meta?.images || {};
          console.log(`[Figma] Image ref map has ${Object.keys(imageRefMap).length} entries`);
        } else {
          console.warn(`[Figma] Images endpoint returned ${imagesRes.status}`);
        }
      } catch (imgErr) {
        console.warn("[Figma] Images API error:", imgErr);
      }
    }

    // ── Step 4: Download screenshots + fills, build results ─────────────────
    await mkdir(baseDir, { recursive: true });

    const results: Array<{
      id: string;
      name: string;
      base64: string;
      localPath: string;
      assetUrls: string[];
    }> = [];

    const perFrameAssets: Record<string, string[]> = {};  // frameName → public URLs

    for (const frame of capped) {
      const imageUrl = exportData.images?.[frame.id];
      if (!imageUrl) {
        console.warn(`[Figma] No image URL for frame "${frame.name}" — skipping`);
        continue;
      }

      const frameSlugName = frameImgSlug(frame.name);
      const screenshotFile = `${frameSlugName}.png`;
      const screenshotPath = path.join(baseDir, screenshotFile);
      const screenshotUrl  = `${baseUrl}/${screenshotFile}`;

      let base64 = "";
      try {
        console.log(`[Figma] Downloading frame "${frame.name}"…`);
        const buf = await downloadBuffer(imageUrl);
        await writeFile(screenshotPath, buf);
        base64 = buf.toString("base64");
        console.log(`[Figma] Frame "${frame.name}" → ${Math.round(buf.length / 1024)}KB`);
      } catch (dlErr) {
        console.warn(`[Figma] Download failed for "${frame.name}":`, dlErr);
        continue;
      }

      // ── Download image fills for this frame ────────────────────────────────
      const refs  = perFrameRefs[frame.name] || [];
      const assetUrls: string[] = [];

      if (refs.length > 0) {
        const fillDir = path.join(baseDir, frameSlugName, "images");
        await mkdir(fillDir, { recursive: true });

        let idx = 0;
        for (const ref of refs) {
          const cdnUrl = imageRefMap[ref];
          if (!cdnUrl) continue;
          try {
            const fillBuf  = await downloadBuffer(cdnUrl);
            const fillFile = `image-${String(idx).padStart(2, "0")}.png`;
            await writeFile(path.join(fillDir, fillFile), fillBuf);
            const publicUrl = `${baseUrl}/${frameSlugName}/images/${fillFile}`;
            assetUrls.push(publicUrl);
            idx++;
            console.log(`[Figma]   fill[${idx}] "${frame.name}" → ${fillFile}`);
          } catch (fillErr) {
            console.warn(`[Figma]   fill download error for ref ${ref}:`, fillErr);
          }
        }
      }

      perFrameAssets[frame.name] = assetUrls;
      results.push({ id: frame.id, name: frame.name, base64, localPath: screenshotUrl, assetUrls });
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Could not export any frames. The frames may be empty or invisible." },
        { status: 422 },
      );
    }

    return NextResponse.json({ frames: results, projectSlug, canvasSlug, perFrameAssets });
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
