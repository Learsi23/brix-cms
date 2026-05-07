'use client';

import { useState, useRef, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBlockProps {
  data: BlockData;
}

export default function ChatBlock({ data }: ChatBlockProps) {
  const displayMode = getFieldValue(data, 'displayMode', 'embedded') as 'fullscreen' | 'embedded';
  const bgColor = getFieldValue(data, 'backgroundColor', '#FFFFFF');
  const borderColor = getFieldValue(data, 'borderColor', '#E2E8F0');
  const borderRadius = getFieldValue(data, 'borderRadius', '16px');
  const title = getFieldValue(data, 'title', 'AI Assistant');
  const headerBgColor = getFieldValue(data, 'headerBgColor', '#6366F1');
  const headerGradientColor = getFieldValue(data, 'headerGradientColor', '#8B5CF6');
  const headerTextColor = getFieldValue(data, 'headerTextColor', '#FFFFFF');
  const titleSize = getFieldValue(data, 'titleSize', '18px');
  const logo = getFieldValue(data, 'logo', '');
  const logoSize = getFieldValue(data, 'logoSize', '28px');
  const aiLogo = getFieldValue(data, 'aiLogo', '');
  const aiLogoSize = getFieldValue(data, 'aiLogoSize', '28px');
  const chatBgColor = getFieldValue(data, 'chatBgColor', '#F8FAFC');
  const userBubbleColor = getFieldValue(data, 'userBubbleColor', '#6366F1');
  const userTextColor = getFieldValue(data, 'userTextColor', '#FFFFFF');
  const aiBubbleColor = getFieldValue(data, 'aiBubbleColor', '#FFFFFF');
  const aiTextColor = getFieldValue(data, 'aiTextColor', '#1E293B');
  const aiBubbleBorderColor = getFieldValue(data, 'aiBubbleBorderColor', '#E2E8F0');
  const inputBgColor = getFieldValue(data, 'inputBgColor', '#FFFFFF');
  const inputTextColor = getFieldValue(data, 'inputTextColor', '#0F172A');
  const inputBorderColor = getFieldValue(data, 'inputBorderColor', '#CBD5E1');
  const sendButtonColor = getFieldValue(data, 'sendButtonColor', '#6366F1');
  const customPrompt = getFieldValue(data, 'customPrompt', '');
  const welcomeMessage = getFieldValue(data, 'welcomeMessage', '');

  const [messages, setMessages] = useState<Message[]>(
    welcomeMessage ? [{ role: 'assistant', content: welcomeMessage }] : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          systemPrompt: customPrompt || undefined,
        }),
      });
      const json = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: json.message || json.content || 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  }

  const isFullscreen = displayMode === 'fullscreen';

  const widget = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100%' : '500px',
        backgroundColor: bgColor,
        borderRadius: isFullscreen ? 0 : borderRadius,
        border: isFullscreen ? 'none' : `1px solid ${borderColor}`,
        overflow: 'hidden',
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${headerBgColor}, ${headerGradientColor})` }}
      >
        {logo
          ? <img src={logo} alt="logo" style={{ width: logoSize, height: logoSize, objectFit: 'contain' }} />
          : <span style={{ fontSize: logoSize, lineHeight: '1' }}>🤖</span>}
        {title && (
          <span className="font-semibold" style={{ color: headerTextColor, fontSize: titleSize }}>
            {title}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: chatBgColor }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">Start a conversation...</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              aiLogo
                ? <img src={aiLogo} alt="ai" style={{ width: aiLogoSize, height: aiLogoSize, borderRadius: '50%', flexShrink: 0 }} />
                : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: aiBubbleColor, border: `1px solid ${aiBubbleBorderColor}` }}>🤖</div>
            )}
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={msg.role === 'user'
                ? { backgroundColor: userBubbleColor, color: userTextColor, borderBottomRightRadius: 4 }
                : { backgroundColor: aiBubbleColor, color: aiTextColor, border: `1px solid ${aiBubbleBorderColor}`, borderBottomLeftRadius: 4 }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm" style={{ backgroundColor: aiBubbleColor, color: aiTextColor, border: `1px solid ${aiBubbleBorderColor}` }}>
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3 p-4 flex-shrink-0" style={{ backgroundColor: bgColor, borderTop: `1px solid ${inputBorderColor}` }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: inputBgColor, color: inputTextColor, border: `1px solid ${inputBorderColor}` }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: sendButtonColor, color: '#fff' }}
        >
          <i className="fas fa-paper-plane text-sm" />
        </button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
        {widget}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', backgroundColor: bgColor }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem' }}>
        {widget}
      </div>
    </div>
  );
}
