// /api/chat — AI chat endpoint (Ollama integration)
// Uses semantic search for PDF knowledge base + Ollama for chat
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, provider = 'ollama', model, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get Ollama configuration from site config
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = model || process.env.OLLAMA_MODEL || 'llama3.2';

    // Build messages for Ollama
    const messages = [
      { role: 'system', content: 'You are a helpful assistant for this website. Answer questions based on the provided context.' },
      ...(body.history || []),
      { role: 'user', content: message }
    ];

    // Call Ollama API
    const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages,
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return NextResponse.json({ 
        error: 'Ollama error', 
        details: errorText 
      }, { status: 502 });
    }

    const data = await ollamaResponse.json();
    
    return NextResponse.json({
      message: data.message?.content || 'No response from AI',
      model: ollamaModel,
      done: data.done
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}