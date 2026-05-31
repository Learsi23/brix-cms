'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBlockProps {
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
  } catch { /* quota exceeded or private mode */ }
}

export default function ChatBlock({ data }: ChatBlockProps) {
  const displayMode  = getFieldValue(data, 'displayMode',          'embedded') as 'fullscreen' | 'embedded';
  const bgColor      = getFieldValue(data, 'backgroundColor',      '#FFFFFF');
  const borderColor  = getFieldValue(data, 'borderColor',          '#E2E8F0');
  const borderRadius = getFieldValue(data, 'borderRadius',         '16px');
  const title        = getFieldValue(data, 'title',                'AI Assistant');
  const headerBg     = getFieldValue(data, 'headerBgColor',        '#6366F1');
  const headerGrad   = getFieldValue(data, 'headerGradientColor',  '#8B5CF6');
  const headerText   = getFieldValue(data, 'headerTextColor',      '#FFFFFF');
  const titleSize    = getFieldValue(data, 'titleSize',            '18px');
  const logo         = getFieldValue(data, 'logo',                 '');
  const logoSize     = getFieldValue(data, 'logoSize',             '28px');
  const aiLogo       = getFieldValue(data, 'aiLogo',               '');
  const aiLogoSize   = getFieldValue(data, 'aiLogoSize',           '28px');
  const chatBg       = getFieldValue(data, 'chatBgColor',          '#F8FAFC');
  const userBubble   = getFieldValue(data, 'userBubbleColor',      '#6366F1');
  const userText     = getFieldValue(data, 'userTextColor',        '#FFFFFF');
  const aiBubble     = getFieldValue(data, 'aiBubbleColor',        '#FFFFFF');
  const aiText       = getFieldValue(data, 'aiTextColor',          '#1E293B');
  const aiBorder     = getFieldValue(data, 'aiBubbleBorderColor',  '#E2E8F0');
  const inputBg      = getFieldValue(data, 'inputBgColor',         '#FFFFFF');
  const inputText    = getFieldValue(data, 'inputTextColor',       '#0F172A');
  const inputBorder  = getFieldValue(data, 'inputBorderColor',     '#CBD5E1');
  const sendBtn      = getFieldValue(data, 'sendButtonColor',      '#6366F1');
  const customPrompt = getFieldValue(data, 'customPrompt',         '');
  const welcome      = getFieldValue(data, 'welcomeMessage',       '');

  // Stable chat ID — use a ref so it stays constant across renders
  const chatIdRef = useRef<string>('');
  if (!chatIdRef.current) {
    chatIdRef.current = `chat_${Math.random().toString(36).slice(2, 10)}`;
  }

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadHistory(chatIdRef.current);
    if (saved.length > 0) return saved;
    return welcome ? [{ role: 'assistant', content: welcome }] : [];
  });

  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist whenever messages change (after mount)
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

    // Add empty assistant placeholder for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          messages: history.slice(0, -1), // history without the new user message (it's sent as `message`)
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
      const errorText = err instanceof Error ? err.message : 'Connection error.';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: errorText };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, customPrompt]);

  const isFullscreen = displayMode === 'fullscreen';

  const widget = (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        height: isFullscreen ? '100%' : '500px',
        backgroundColor: bgColor,
        borderRadius: isFullscreen ? 0 : borderRadius,
        border: isFullscreen ? 'none' : `1px solid ${borderColor}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${headerBg}, ${headerGrad})` }}
      >
        {logo
          ? <img src={logo} alt="logo" style={{ width: logoSize, height: logoSize, objectFit: 'contain' }} />
          : <i className="fas fa-robot" style={{ fontSize: logoSize, color: headerText }} />}
        {title && (
          <span className="font-semibold" style={{ color: headerText, fontSize: titleSize }}>
            {title}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: chatBg }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">Start a conversation…</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              aiLogo
                ? <img src={aiLogo} alt="ai" style={{ width: aiLogoSize, height: aiLogoSize, borderRadius: '50%', flexShrink: 0 }} />
                : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: aiBubble, border: `1px solid ${aiBorder}`, color: aiText }}>
                    <i className="fas fa-robot text-xs" />
                  </div>
            )}
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              style={msg.role === 'user'
                ? { backgroundColor: userBubble, color: userText, borderBottomRightRadius: 4 }
                : { backgroundColor: aiBubble, color: aiText, border: `1px solid ${aiBorder}`, borderBottomLeftRadius: 4 }}
            >
              {msg.content}
              {/* Blinking cursor while streaming the last assistant message */}
              {loading && i === messages.length - 1 && msg.role === 'assistant' && (
                <span className="inline-block w-0.5 h-4 bg-current align-middle ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        {loading && (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
          <div className="flex gap-3 justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm"
              style={{ backgroundColor: aiBubble, color: aiText, border: `1px solid ${aiBorder}` }}>
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 p-4 flex-shrink-0"
        style={{ backgroundColor: bgColor, borderTop: `1px solid ${inputBorder}` }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Type your message…"
          disabled={loading}
          className="flex-1 rounded-xl mx-24 px-4 py-3 text-sm outline-none disabled:opacity-60"
          style={{ backgroundColor: inputBg, color: inputText, border: `1px solid ${inputBorder}` }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: sendBtn, color: '#fff' }}
        >
          <i className="fas fa-paper-plane text-sm" />
        </button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>{widget}</div>;
  }

  return (
    <div style={{ padding: '2rem 0', backgroundColor: bgColor }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem' }}>
        {widget}
      </div>
    </div>
  );
}
