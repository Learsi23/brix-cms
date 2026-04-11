/**
 * Hook para generar páginas con IA desde el frontend
 */

import { useState } from "react";

interface UseAIPageGenerationOptions {
  ollamaUrl?: string;
  model?: string;
}

interface GeneratedPage {
  id: string;
  title: string;
  slug: string;
  blocks: unknown[];
}

export function useAIPageGeneration(options?: UseAIPageGenerationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState<GeneratedPage | null>(null);

  const generatePage = async (
    prompt: string,
    modelOverride?: string,
    selectedMedia?: string,
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setPage(null);

    try {
      const response = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          selectedMedia,
          ...(options?.ollamaUrl && { ollamaUrl: options.ollamaUrl }),
          model: modelOverride || options?.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate page");
      }

      const data = await response.json();
      setPage(data.page);
      setSuccess(true);
      return data.page;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generatePage,
    loading,
    error,
    success,
    page,
  };
}

/**
 * Utilidad para hacer pruebas rápidas del endpoint desde el navegador
 */
export async function generatePageWithAI(
  prompt: string,
  options?: UseAIPageGenerationOptions,
): Promise<GeneratedPage> {
  const response = await fetch("/api/ai/generate-page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      ...(options?.ollamaUrl && { ollamaUrl: options.ollamaUrl }),
      ...(options?.model && { model: options.model }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate page");
  }

  const data = await response.json();
  return data.page;
}
