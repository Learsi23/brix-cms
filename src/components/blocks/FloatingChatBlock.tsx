'use client';

import { useState, useRef, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingChatBlockProps {
  data: BlockData;
}

export default function FloatingChatBlock({ data }: FloatingChatBlockProps) {
  const position = getFieldValue(data, 'position', 'right') as 'right' | 'left';
  const buttonColor = getFieldValue(data, 'buttonColor', '#6366F1');
  const buttonGradientColor = getFieldValue(data, 'buttonGradientColor', '#8B5CF6');
  const buttonTextColor = getFieldValue(data, 'buttonTextColor', '#FFFFFF');
  const buttonIcon = getFieldValue(data, 'buttonIcon', '💬');
  const buttonSize = getFieldValue(data, 'buttonSize', '60px');
  const buttonGlow = getFieldValue(data, 'buttonGlow', 'true') === 'true';
  const panelBgColor = getFieldValue(data, 'panelBgColor', '#0F172A');
  const headerBgColor = getFieldValue(data, 'headerBgColor', '#1E293B');
  const headerGradientColor = getFieldValue(data, 'headerGradientColor', '#6366F1');
  const headerTextColor = getFieldValue(data, 'headerTextColor', '#F8FAFC');
  const chatBgColor = getFieldValue(data, 'chatBgColor', '#0F172A');
  const userBubbleColor = getFieldValue(data, 'userBubbleColor', '#6366F1');
  const userTextColor = getFieldValue(data, 'userTextColor', '#FFFFFF');
  const aiBubbleColor = getFieldValue(data, 'aiBubbleColor', '#1E293B');
  const aiTextColor = getFieldValue(data, 'aiTextColor', '#E2E8F0');
  const inputBgColor = getFieldValue(data, 'inputBgColor', '#1E293B');
  const inputTextColor = getFieldValue(data, 'inputTextColor', '#F8FAFC');
  const inputBorderColor = getFieldValue(data, 'inputBorderColor', '#334155');
  const sendButtonColor = getFieldValue(data, 'sendButtonColor', '#6366F1');
  const customPrompt = getFieldValue(data, 'customPrompt', '');
  const welcomeMessage = getFieldValue(data, 'welcomeMessage', 'Hi! How can I help you today?');
  const logo = getFieldValue(data, 'logo', '');
  const logoSize = getFieldValue(data, 'logoSize', '28px');
  const aiLogo = getFieldValue(data, 'aiLogo', '');
  const aiLogoSize = getFieldValue(data, 'aiLogoSize', '28px');

  const [open, setOpen] = useState(false);
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
      setMessages(prev => [...prev, { role: 'assistant', content: json.message || json.content || 'Sorry, I could not respond.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

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
            backgroundColor: panelBgColor,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${headerBgColor}, ${headerGradientColor})` }}
          >
            <div className="flex items-center gap-2">
              {logo
                ? <img src={logo} alt="logo" style={{ width: logoSize, height: logoSize, objectFit: 'contain' }} />
                : <span style={{ fontSize: logoSize, lineHeight: '1' }}>🤖</span>}
              <span className="font-semibold text-sm" style={{ color: headerTextColor }}>AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: headerTextColor }} className="opacity-70 hover:opacity-100">
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: chatBgColor }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  aiLogo
                    ? <img src={aiLogo} alt="ai" style={{ width: aiLogoSize, height: aiLogoSize, borderRadius: '50%', flexShrink: 0 }} />
                    : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: aiBubbleColor }}>🤖</div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { backgroundColor: userBubbleColor, color: userTextColor, borderBottomRightRadius: 4 }
                    : { backgroundColor: aiBubbleColor, color: aiTextColor, borderBottomLeftRadius: 4 }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="px-3 py-2 rounded-2xl text-sm" style={{ backgroundColor: aiBubbleColor, color: aiTextColor, borderBottomLeftRadius: 4 }}>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 p-3 flex-shrink-0" style={{ backgroundColor: panelBgColor, borderTop: `1px solid ${inputBorderColor}` }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: inputBgColor, color: inputTextColor, border: `1px solid ${inputBorderColor}` }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              style={{ backgroundColor: sendButtonColor, color: '#fff' }}
            >
              <i className="fas fa-paper-plane text-xs" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          width: buttonSize,
          height: buttonSize,
          background: `linear-gradient(135deg, ${buttonColor}, ${buttonGradientColor})`,
          color: buttonTextColor,
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
