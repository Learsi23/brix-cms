// /api/ai/usage - AI Usage Statistics and Cost Tracking
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Period = "today" | "week" | "month" | "all";

function getDateRange(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "today":
      now.setHours(0, 0, 0, 0);
      return now;
    case "week":
      now.setDate(now.getDate() - 7);
      return now;
    case "month":
      now.setMonth(now.getMonth() - 1);
      return now;
    default:
      return null;
  }
}

const PROVIDER_RATES: Record<string, { input: number; output: number }> = {
  gemini: { input: 0.00000035, output: 0.0000014 }, // per token
  deepseek: { input: 0.00000014, output: 0.00000028 },
  mistral: { input: 0.0000001, output: 0.0000003 },
  ollama: { input: 0, output: 0 }, // free
};

function calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const rates = PROVIDER_RATES[provider] || { input: 0, output: 0 };
  return inputTokens * rates.input + outputTokens * rates.output;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") || "month") as Period;
    const startDate = getDateRange(period);

    const where = startDate ? { createdAt: { gte: startDate } } : {};

    const logs = await prisma.aiUsageLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Calculate totals
    const totals = logs.reduce(
      (acc, log) => ({
        calls: acc.calls + 1,
        inputTokens: acc.inputTokens + log.inputTokens,
        outputTokens: acc.outputTokens + log.outputTokens,
        cost: acc.cost + log.cost,
      }),
      { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 }
    );

    // Group by provider
    const byProvider: Record<string, { inputTokens: number; outputTokens: number; cost: number; calls: number }> = {};
    logs.forEach((log) => {
      if (!byProvider[log.provider]) {
        byProvider[log.provider] = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0 };
      }
      byProvider[log.provider].inputTokens += log.inputTokens;
      byProvider[log.provider].outputTokens += log.outputTokens;
      byProvider[log.provider].cost += log.cost;
      byProvider[log.provider].calls += 1;
    });

    // Recent calls
    const recent = logs.slice(0, 10).map((log) => ({
      date: log.createdAt.toISOString().split("T")[0],
      operation: log.operation,
      provider: log.provider,
      tokens: log.totalTokens,
      cost: log.cost,
    }));

    return NextResponse.json({
      totalCalls: totals.calls,
      totalInput: totals.inputTokens,
      totalOutput: totals.outputTokens,
      totalCost: totals.cost,
      byProvider: Object.entries(byProvider).map(([provider, data]) => ({
        provider,
        ...data,
      })),
      recent,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { provider, operation, inputTokens, outputTokens, model } = await req.json();

    if (!provider || !operation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalTokens = (inputTokens || 0) + (outputTokens || 0);
    const cost = calculateCost(provider, inputTokens || 0, outputTokens || 0);

    const log = await prisma.aiUsageLog.create({
      data: {
        provider,
        operation: operation || "Generate",
        inputTokens: inputTokens || 0,
        outputTokens: outputTokens || 0,
        totalTokens,
        cost,
        model: model || null,
      },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.aiUsageLog.deleteMany();
    return NextResponse.json({ success: true, message: "All usage logs cleared" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
