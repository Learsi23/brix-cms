import { NextRequest, NextResponse } from "next/server";
import { generateSystemPrompt, getBlocksDocumentation } from "@/lib/ai/prompts";

/**
 * GET /api/ai/debug
 * Endpoint de debug para verificar que el sistema está funcionando
 * Retorna información útil para troubleshooting
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get("action");

  // Retornar documentación de bloques
  if (action === "blocks-doc") {
    return NextResponse.json({
      documentation: getBlocksDocumentation(),
    });
  }

  // Retornar sistema prompt
  if (action === "system-prompt") {
    return NextResponse.json({
      systemPrompt: generateSystemPrompt(),
    });
  }

  // Verificar conectividad con Ollama
  if (action === "check-ollama") {
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          {
            status: "connected",
            url: ollamaUrl,
            models: data.models || [],
          },
          { status: 200 },
        );
      } else {
        return NextResponse.json(
          {
            status: "error",
            error: `Ollama responded with ${response.status}`,
            url: ollamaUrl,
          },
          { status: 503 },
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          status: "unreachable",
          error: error instanceof Error ? error.message : "Unknown error",
          url: ollamaUrl,
          hint: "Make sure Ollama is running with: ollama serve",
        },
        { status: 503 },
      );
    }
  }

  // Información general
  return NextResponse.json({
    message: "AI Debug Endpoint",
    endpoints: [
      "?action=check-ollama - Verificar conexión con Ollama",
      "?action=system-prompt - Ver system prompt",
      "?action=blocks-doc - Ver documentación de bloques disponibles",
    ],
    environment: {
      OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
      OLLAMA_MODEL: process.env.OLLAMA_MODEL || "mistral",
    },
  });
}

/**
 * POST /api/ai/debug?action=test-prompt
 * Prueba rápida enviando un prompt a Ollama
 */
export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "test-prompt") {
    try {
      const { prompt, model = process.env.OLLAMA_MODEL || "mistral" } =
        await req.json();

      if (!prompt) {
        return NextResponse.json(
          { error: "Se requiere un prompt" },
          { status: 400 },
        );
      }

      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(120000), // 2 minutos timeout
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Ollama error: ${response.statusText}`,
            status: response.status,
          },
          { status: response.status },
        );
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        model,
        prompt,
        response: data.response,
        tokens: data.eval_count,
        duration: data.eval_duration,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        {
          error: message,
          hint: "Ensure Ollama is running and the model exists",
        },
        { status: 503 },
      );
    }
  }

  return NextResponse.json(
    {
      error: "Unknown action",
      availableActions: ["test-prompt"],
    },
    { status: 400 },
  );
}
