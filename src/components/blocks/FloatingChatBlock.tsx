'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingChatBlockProps {
  data: BlockData;
}

const STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function loadHistory(chatId: string): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`brixcms_chat_${chatId}`);
    if (!raw) return [];
    const { messages, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > STORAGE_TTL_MS) {
      localStorage.removeItem(`brixcms_chat_${chatId}`);
      return [];
    }
    return messages ?? [];
  } catch { return []; }
}

function saveHistory(chatId: string, messages: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`brixcms_chat_${chatId}`, JSON.stringify({ messages, timestamp: Date.now() }));
  } catch { /* quota or private mode */ }
}

export default function FloatingChatBlock({ data }: FloatingChatBlockProps) {
  const position       = getFieldValue(data, 'position',            'right') as 'right' | 'left';
  const buttonColor    = getFieldValue(data, 'buttonColor',         '#6366F1');
  const buttonGrad     = getFieldValue(data, 'buttonGradientColor', '#8B5CF6');
  const buttonText     = getFieldValue(data, 'buttonTextColor',     '#FFFFFF');
  const buttonIcon     = getFieldValue(data, 'buttonIcon',          '💬');
  const buttonSize     = getFieldValue(data, 'buttonSize',          '60px');
  const buttonGlow     = getFieldValue(data, 'buttonGlow',          'true') === 'true';
  const panelBg        = getFieldValue(data, 'panelBgColor',        '#0F172A');
  const headerBg       = getFieldValue(data, 'headerBgColor',       '#1E293B');
  const headerGrad     = getFieldValue(data, 'headerGradientColor', '#6366F1');
  const headerText     = getFieldValue(data, 'headerTextColor',     '#F8FAFC');
  const chatBg         = getFieldValue(data, 'chatBgColor',         '#0F172A');
  const userBubble     = getFieldValue(data, 'userBubbleColor',     '#6366F1');
  const userText       = getFieldValue(data, 'userTextColor',       '#FFFFFF');
  const aiBubble       = getFieldValue(data, 'aiBubbleColor',       '#1E293B');
  const aiText         = getFieldValue(data, 'aiTextColor',         '#E2E8F0');
  const inputBg        = getFieldValue(data, 'inputBgColor',        '#1E293B');
  const inputText      = getFieldValue(data, 'inputTextColor',      '#F8FAFC');
  const inputBorder    = getFieldValue(data, 'inputBorderColor',    '#334155');
  const sendBtn        = getFieldValue(data, 'sendButtonColor',     '#6366F1');
  const customPrompt   = getFieldValue(data, 'customPrompt',        '');
  const welcome        = getFieldValue(data, 'welcomeMessage',      'Hi! How can I help you today?');
  const logo           = getFieldValue(data, 'logo',                '');
  const logoSize       = getFieldValue(data, 'logoSize',            '28px');
  const aiLogo         = getFieldValue(data, 'aiLogo',              '');
  const aiLogoSize     = getFieldValue(data, 'aiLogoSize',          '28px');
  const chatTitle      = getFieldValue(data, 'title',               'AI Assistant');

  // Stable chat ID
  const chatIdRef = useRef<string>('');
  if (!chatIdRef.current) {
    chatIdRef.current = `float_${Math.random().toString(36).slice(2, 10)}`;
  }

  const [open, setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadHistory(chatIdRef.current);
    if (saved.length > 0) return saved;
    return welcome ? [{ role: 'assistant', content: welcome }] : [];
  });
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Persist chat history
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    saveHistory(chatIdRef.current, messages);
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    const history = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(history);
    setLoading(true);

    // Add empty assistant placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          messages: history.slice(0, -1),
          systemPrompt: customPrompt || undefined,
        }),
      });

      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.error) throw new Error(payload.error);
            if (payload.token) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + payload.token,
                };
                return updated;
              });
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Connection error. Please try again.';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: errorText };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, customPrompt]);

  const glowStyle = buttonGlow
    ? { boxShadow: `0 0 20px ${buttonColor}80, 0 4px 15px rgba(0,0,0,0.3)` }
    : { boxShadow: '0 4px 15px rgba(0,0,0,0.3)' };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        [position]: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: position === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {open && (
        <div
          className="mb-3 rounded-2xl overflow-hidden flex flex-col"
          style={{
            width: '360px',
            maxWidth: 'calc(100vw - 3rem)',
            height: '480px',
            backgroundColor: panelBg,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${headerBg}, ${headerGrad})` }}
          >
            <div className="flex items-center gap-2">
              {logo
                ? <img src={logo} alt="logo" style={{ width: logoSize, height: logoSize, objectFit: 'contain' }} />
                : <i className="fas fa-robot" style={{ fontSize: logoSize, color: headerText }} />}
              <span className="font-semibold text-sm" style={{ color: headerText }}>{chatTitle}</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: headerText }} className="opacity-70 hover:opacity-100">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: chatBg }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  aiLogo
                    ? <img src={aiLogo} alt="ai"
                        style={{ width: aiLogoSize, height: aiLogoSize, borderRadius: '50%', flexShrink: 0 }} />
                    : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ backgroundColor: aiBubble, color: aiText }}>
                        <i className="fas fa-robot" style={{ fontSize: '10px' }} />
                      </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={msg.role === 'user'
                    ? { backgroundColor: userBubble, color: userText, borderBottomRightRadius: 4 }
                    : { backgroundColor: aiBubble, color: aiText, borderBottomLeftRadius: 4 }}
                >
                  {msg.content}
                  {loading && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span className="inline-block w-0.5 h-3.5 bg-current align-middle ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            {loading && (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
              <div className="flex gap-2 justify-start">
                <div className="px-3 py-2 rounded-2xl text-sm"
                  style={{ backgroundColor: aiBubble, color: aiText, borderBottomLeftRadius: 4 }}>
                  <span className="animate-pulse">…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 flex-shrink-0"
            style={{ backgroundColor: panelBg, borderTop: `1px solid ${inputBorder}` }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message…"
              disabled={loading}
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none disabled:opacity-60"
              style={{ backgroundColor: inputBg, color: inputText, border: `1px solid ${inputBorder}` }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              style={{ backgroundColor: sendBtn, color: '#fff' }}
            >
              <i className="fas fa-paper-plane text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          width: buttonSize,
          height: buttonSize,
          background: `linear-gradient(135deg, ${buttonColor}, ${buttonGrad})`,
          color: buttonText,
          ...glowStyle,
        }}
      >
        {open
          ? <i className="fas fa-times text-lg" />
          : <span style={{ fontSize: `calc(${buttonSize} * 0.45)`, lineHeight: '1' }}>{buttonIcon}</span>}
      </button>
    </div>
  );
}
