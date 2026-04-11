/**
 * GET /api/figma/file?url=https://www.figma.com/design/ABC123/...
 *
 * Fetches a Figma file's page + frame structure using the saved PAT.
 * Returns only the data the importer UI needs: pages and their top-level frames.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptKey } from "@/lib/ai/encryption";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract file key from any Figma URL format */
function extractFileKey(input: string): string | null {
  // https://www.figma.com/file/KEY/name  or  /design/KEY/name
  const match = input.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/** Figma document node (simplified) */
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: { width: number; height: number };
}

interface FigmaFile {
  name: string;
  document: { children: FigmaNode[] }; // top-level children are CANVAS (pages)
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlOrKey = searchParams.get("url") || searchParams.get("key");

    if (!urlOrKey?.trim()) {
      return NextResponse.json(
        { error: "Provide ?url= with the Figma file URL" },
        { status: 400 },
      );
    }

    // ── Load saved Figma PAT ─────────────────────────────────────────
    const saved = await prisma.apiKey.findUnique({ where: { provider: "figma" } });
    if (!saved) {
      return NextResponse.json(
        { error: "No Figma token saved. Go to Configuration → API Keys and save your Figma Personal Access Token." },
        { status: 401 },
      );
    }
    const pat = decryptKey(saved.encryptedKey, saved.iv, saved.authTag);

    // ── Extract file key ─────────────────────────────────────────────
    const fileKey = extractFileKey(urlOrKey) ?? urlOrKey.trim();
    if (!fileKey || fileKey.includes("/") || fileKey.length < 5) {
      return NextResponse.json(
        { error: "Could not extract a valid file key from the URL provided." },
        { status: 400 },
      );
    }

    // ── Call Figma REST API ──────────────────────────────────────────
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(
      `https://api.figma.com/v1/files/${fileKey}?depth=2`,
      {
        headers: { "X-Figma-Token": pat },
        signal: controller.signal,
      },
    );
    clearTimeout(timer);

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 403 || res.status === 401) {
        return NextResponse.json(
          { error: "Figma token is invalid or has expired. Generate a new one with scope file_content:read." },
          { status: 401 },
        );
      }
      if (res.status === 404) {
        return NextResponse.json(
          { error: "File not found. Check the URL and that your account has access to this file." },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `Figma API error ${res.status}: ${txt.substring(0, 200)}` },
        { status: 502 },
      );
    }

    const data: FigmaFile = await res.json();

    // ── Build page + frame list ──────────────────────────────────────
    // Figma document: document.children = CANVAS nodes (pages)
    // Each CANVAS's children = top-level FRAME nodes (frames / sections)
    const pages = (data.document.children || [])
      .filter((node) => node.type === "CANVAS")
      .map((page) => ({
        id: page.id,
        name: page.name,
        frames: (page.children || [])
          .filter((n) => n.type === "FRAME" || n.type === "COMPONENT" || n.type === "GROUP")
          .map((frame) => ({
            id: frame.id,
            name: frame.name,
            width: Math.round(frame.absoluteBoundingBox?.width ?? 0),
            height: Math.round(frame.absoluteBoundingBox?.height ?? 0),
          })),
      }));

    return NextResponse.json({
      fileKey,
      fileName: data.name,
      pages,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("abort")) {
      return NextResponse.json(
        { error: "Request to Figma timed out (20s). Check your connection." },
        { status: 504 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
