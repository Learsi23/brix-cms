// /api/chat — Chat AI endpoint
// Equivalente al ChatBlock de .NET con Ollama
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, customPrompt } = body as { message: string; customPrompt?: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
    }

    // Intentar conectar con Ollama local
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: message,
          system: customPrompt || 'Eres un asistente útil. Responde de forma concisa y amable.',
          stream: false,
        }),
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        return NextResponse.json({ response: data.response });
      }
    } catch {
      // Ollama no disponible, usar respuesta simulada
    }

    // Respuesta simulada si Ollama no está disponible
    const responses = [
      '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      'Entiendo tu consulta. Permíteme ayudarte con eso.',
      'Es una excelente pregunta. Te sugiero revisar nuestra sección de ayuda.',
      '¿Hay algo más en lo que pueda asistirte?',
      'Gracias por tu mensaje. Estoy aquí para ayudarte.',
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({
      response: randomResponse,
      note: 'Ollama no está disponible. Esta es una respuesta simulada.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
