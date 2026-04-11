/**
 * /api/ai/api-keys
 * Manages encrypted API keys for external AI providers (Gemini, DeepSeek, Mistral).
 * Keys are stored in SQLite using AES-256-GCM encryption.
 * The plaintext key is NEVER returned — only a masked version is exposed.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptKey, maskKey } from "@/lib/ai/encryption";

type Provider = "gemini" | "deepseek" | "mistral" | "figma";
const VALID_PROVIDERS: Provider[] = ["gemini", "deepseek", "mistral", "figma"];

// ── GET — List saved providers (masked keys, never plaintext) ────────────────

export async function GET() {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { provider: "asc" },
    });

    // Return only provider names + whether a key exists — never the raw key
    const result = keys.map((k) => ({
      provider: k.provider,
      hasSavedKey: true,
      updatedAt: k.updatedAt.toISOString(),
    }));

    return NextResponse.json({ keys: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST — Save or update an API key ────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !VALID_PROVIDERS.includes(provider as Provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 8) {
      return NextResponse.json({ error: "API key too short or missing" }, { status: 400 });
    }

    const { encryptedKey, iv, authTag } = encryptKey(apiKey.trim());

    // Upsert — create or replace existing key for this provider
    const saved = await prisma.apiKey.upsert({
      where: { provider },
      update: { encryptedKey, iv, authTag },
      create: { provider, encryptedKey, iv, authTag },
    });

    return NextResponse.json({
      success: true,
      provider: saved.provider,
      masked: maskKey(apiKey.trim()),
      updatedAt: saved.updatedAt.toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DELETE — Remove a saved key ──────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { provider } = await req.json();

    if (!provider || !VALID_PROVIDERS.includes(provider as Provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    await prisma.apiKey.delete({ where: { provider } });

    return NextResponse.json({ success: true, provider });
  } catch (err) {
    // If not found, treat as success
    if (err instanceof Error && err.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ success: true });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
