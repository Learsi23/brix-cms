// /api/ai/generation-history - AI Page Generation History
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const logs = await prisma.aiGenerationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = logs.map((log) => ({
      id: log.id,
      pageId: log.pageId,
      pageTitle: log.pageTitle,
      prompt: log.prompt,
      provider: log.provider,
      mode: log.mode,
      date: log.createdAt.toISOString().split("T")[0] + " " + log.createdAt.toTimeString().split(" ")[0].substring(0, 5),
      createdAt: log.createdAt,
    }));

    return NextResponse.json({ logs: formatted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pageId, pageTitle, prompt, provider, mode } = await req.json();

    if (!pageTitle || !prompt || !provider) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await prisma.aiGenerationLog.create({
      data: {
        pageId: pageId || null,
        pageTitle,
        prompt: prompt.substring(0, 2000),
        provider,
        mode: mode || "create",
      },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
