"use client";

import { getFieldValue } from "@/lib/blocks/types";
import type { BlockData } from "@/lib/blocks/types";
import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

function renderMarkdown(text: string): string {
  return text
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* (not preceded/followed by another *)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Inline code: `code`
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // URLs: http(s)://...
    .replace(
      /(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>',
    )
    // Newlines → <br>
    .replace(/\n/g, "<br>");
}

// Animated typing indicator (3 bouncing dots)
function TypingIndicator({ aiLogo, aiLogoSize }: { aiLogo: string; aiLogoSize: string }) {
  return (
    <div className="flex items-end gap-2 justify-start">
      {aiLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={aiLogo}
          alt=""
          style={{ width: aiLogoSize, height: aiLogoSize }}
          className="rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <span className="text-xl flex-shrink-0">🤖</span>
      )}
      <div className="bg-slate-100 px-4 py-3 rounded-xl rounded-bl-none flex items-center gap-1">
        <style>{`
          @keyframes chatBounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#94a3b8",
              animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
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
  const welcomeMessage = getFieldValue(data, "WelcomeMessage", "Hello! How can I help you?");
  const customPrompt = getFieldValue(data, "CustomPrompt");
  const aiProvider = getFieldValue(data, "AiProvider", "auto");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const resetConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingContent(null);
    setIsStreaming(false);
    setInput("");
  }, []);

  async function sendMessage() {
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: userText };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setIsStreaming(true);
    setStreamingContent("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          customPrompt,
          aiProvider,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text().catch(() => "Request failed");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorText || "Request failed", isError: true },
        ]);
        setStreamingContent(null);
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let done = false;

      while (!done) {
        const { done: readDone, value } = await reader.read();
        if (readDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            done = true;
            break;
          }
          try {
            const json = JSON.parse(payload);
            if (json.text) {
              accumulated += json.text;
              setStreamingContent(accumulated);
            }
            if (json.error) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: json.error, isError: true },
              ]);
              setStreamingContent(null);
              setIsStreaming(false);
              return;
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      // Finalize: move streamed content into history
      if (accumulated) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
      }
      setStreamingContent(null);
      setIsStreaming(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User reset the conversation
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again.", isError: true },
      ]);
      setStreamingContent(null);
      setIsStreaming(false);
    }
  }

  return (
    <div
      className="container mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            style={{ width: logoSize, height: logoSize }}
            className="object-cover"
          />
        )}
        <h3
          style={{ color: titleColor, fontSize: titleSize }}
          className="font-bold flex-1"
        >
          {title}
        </h3>
        {/* New conversation button */}
        <button
          onClick={resetConversation}
          title="New conversation"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200 text-lg leading-none"
        >
          🔄
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && streamingContent === null && (
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
                  : msg.isError
                  ? "bg-red-50 text-red-600 rounded-bl-none border border-red-200"
                  : "bg-slate-100 text-slate-700 rounded-bl-none"
              }`}
              {...(msg.role === "assistant" && !msg.isError
                ? { dangerouslySetInnerHTML: { __html: renderMarkdown(msg.content) } }
                : {})}
            >
              {msg.role === "user" || msg.isError ? msg.content : undefined}
            </div>
          </div>
        ))}

        {/* In-progress streaming message */}
        {isStreaming && streamingContent !== null && streamingContent === "" && (
          <TypingIndicator aiLogo={aiLogo} aiLogoSize={aiLogoSize} />
        )}
        {isStreaming && streamingContent !== null && streamingContent !== "" && (
          <div className="flex items-end gap-2 justify-start">
            {aiLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aiLogo}
                alt=""
                style={{ width: aiLogoSize, height: aiLogoSize }}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span className="text-xl flex-shrink-0">🤖</span>
            )}
            <div
              className="max-w-[80%] px-4 py-2 rounded-xl rounded-bl-none text-sm bg-slate-100 text-slate-700"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
            />
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
            disabled={isStreaming}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
