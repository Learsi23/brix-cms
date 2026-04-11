import { NextRequest, NextResponse } from "next/server";

interface OllamaModel {
  name: string;
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

interface FormattedModel {
  id: string;
  name: string;
  displayName: string;
}

const OLLAMA_API_URL = process.env.OLLAMA_URL || "http://localhost:11434";

export async function GET(request: NextRequest) {
  try {
    console.log(`[Models API] Connecting to Ollama at: ${OLLAMA_API_URL}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[Models API] Error ${response.status} from Ollama`);
      return NextResponse.json(
        {
          success: false,
          models: [] as FormattedModel[],
          error: `Ollama responded with status ${response.status}`,
        },
        { status: 503 },
      );
    }

    const data: OllamaModelsResponse = await response.json();

    // Filter models that are actual LLMs (not embeddings, rerankers, etc)
    const llmModels =
      data.models?.filter((model: OllamaModel) => {
        const name = model.name.toLowerCase();
        // Exclude embeddings, rerankers and other non-generative models
        const excluded = [
          "embed",
          "embedding",
          "rerank",
          "reranker",
          "bge-",
          "minilm",
          "nomic-embed",
          "all-minilm",
        ];
        return !excluded.some((e) => name.includes(e));
      }) || [];

    // Map to more readable options
    const models: FormattedModel[] = llmModels.map((model: OllamaModel) => ({
      id: model.name,
      name: model.name,
      displayName: formatModelName(model.name),
    }));

    console.log(
      `[Models API] Found ${models.length} generative models`,
    );

    return NextResponse.json({
      success: true,
      models: models.sort((a, b) => a.displayName.localeCompare(b.displayName)),
      total: models.length,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Models API] Request timeout - Ollama is not responding");
      return NextResponse.json(
        {
          success: false,
          models: [] as FormattedModel[],
          error: "Ollama is not responding (timeout)",
        },
        { status: 503 },
      );
    }

    console.error("[Models API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        models: [] as FormattedModel[],
        error: "Failed to connect to Ollama",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}

/**
 * Formats the model name to be human-readable
 * Example: "deepseek-r1:14b" → "Deepseek R1 (14B)"
 */
function formatModelName(name: string): string {
  // Extract the base name and tag
  const [baseName, tag] = name.split(":");

  // Capitalize and improve the base name
  const prettyName = baseName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Add tag information if it exists
  if (tag && tag !== "latest") {
    const size = tag.match(/(\d+[bBgG])/)?.[1] || tag;
    return `${prettyName} (${size.toUpperCase()})`;
  }

  return prettyName;
}
