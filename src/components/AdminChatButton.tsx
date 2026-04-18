"use client";

import { useState, useRef, useEffect } from "react";
import { generateAdminSystemPrompt } from "@/lib/ai/admin-prompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = generateAdminSystemPrompt();

export default function AdminChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    let assistantText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          customPrompt: SYSTEM_PROMPT,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string };
            if (parsed.error) {
              assistantText = `⚠️ ${parsed.error}`;
            } else if (parsed.text) {
              assistantText += parsed.text;
            }
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantText };
              return updated;
            });
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "⚠️ Connection error." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Admin Assistant"
        className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-xl hover:scale-110 transition-all z-50 flex items-center justify-center text-xl"
        style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden z-50 flex flex-col"
          style={{ width: 420, height: 560, animation: "fadeInUp 0.2s ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 text-white" style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)" }}>
            <img src="/images/logo-menu.png" alt="" className="w-7 h-7 rounded-lg bg-white/20 p-0.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div>
              <h3 className="font-bold text-sm">Admin Assistant</h3>
              <p className="text-[10px] text-indigo-200">EdenCMS expert — ask anything</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                Hola! Soy tu Admin Assistant.<br />Conozco EdenCMS de principio a fin. ¿En qué te ayudo?
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-700 rounded-bl-none"
                  }`}
                >
                  {msg.content || (loading && i === messages.length - 1 ? <span className="animate-pulse">…</span> : "")}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-2 rounded-xl rounded-bl-none text-sm text-slate-400 animate-pulse">…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask anything about EdenCMS…"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition"
                style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)" }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
