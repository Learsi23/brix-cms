"use client";

import { getFieldValue } from "@/lib/blocks/types";
import type { BlockData } from "@/lib/blocks/types";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBlock({ data }: { data: BlockData }) {
  const bgColor = getFieldValue(data, "BackgroundColor", "#ffffff");
  const logo = getFieldValue(data, "Logo");
  const logoSize = getFieldValue(data, "LogoSize", "30px");
  const title = getFieldValue(data, "Title", "AI Assistant");
  const titleColor = getFieldValue(data, "TitleColor", "#000000");
  const titleSize = getFieldValue(data, "TitleSize", "24px");
  const aiLogo = getFieldValue(data, "Ai_Logo");
  const aiLogoSize = getFieldValue(data, "Ai_LogoSize", "32px");
  const welcomeMessage = getFieldValue(
    data,
    "WelcomeMessage",
    "Hello! How can I help you?",
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response || "No response" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error processing your message." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            style={{ width: logoSize, height: logoSize }}
            className="object-cover"
          />
        ) : null}
        <h3
          style={{ color: titleColor, fontSize: titleSize }}
          className="font-bold"
        >
          {title}
        </h3>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-700 rounded-xl rounded-bl-none px-4 py-2 flex items-center gap-2">
              {aiLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aiLogo}
                  alt=""
                  style={{ width: aiLogoSize, height: aiLogoSize }}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="text-xl">🤖</span>
              )}
              <p className="text-sm">{welcomeMessage}</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              aiLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aiLogo}
                  alt=""
                  style={{ width: aiLogoSize, height: aiLogoSize }}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="text-xl flex-shrink-0">🤖</span>
              )
            )}
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-700 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-2 rounded-xl rounded-bl-none text-sm text-slate-400">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
