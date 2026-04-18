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
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>',
    )
    .replace(/\n/g, "<br>");
}

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
        <span className="text-lg flex-shrink-0">🤖</span>
      )}
      <div className="bg-slate-100 px-3 py-2.5 rounded-xl rounded-bl-none flex items-center gap-1">
        <style>{`
          @keyframes floatChatBounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#94a3b8",
              animation: `floatChatBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface ChatPanelProps {
  customPrompt: string;
  aiProvider: string;
  welcomeMessage: string;
  logo: string;
  logoSize: string;
  aiLogo: string;
  aiLogoSize: string;
  buttonColor: string;
  buttonTextColor: string;
  onClose: () => void;
}

function ChatPanel({
  customPrompt,
  aiProvider,
  welcomeMessage,
  logo,
  logoSize,
  aiLogo,
  aiLogoSize,
  buttonColor,
  buttonTextColor,
  onClose,
}: ChatPanelProps) {
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
      className="flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      style={{ width: 400, height: 520, animation: "fadeInUp 0.2s ease-out both" }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Mini header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
        style={{ backgroundColor: buttonColor, color: buttonTextColor }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            style={{ width: logoSize, height: logoSize }}
            className="rounded object-cover flex-shrink-0"
          />
        ) : null}
        <span className="font-semibold text-sm flex-1">Assistant</span>

        {/* New conversation button */}
        <button
          onClick={resetConversation}
          title="New conversation"
          className="opacity-80 hover:opacity-100 transition-opacity p-1 rounded leading-none"
          style={{ color: buttonTextColor }}
        >
          ＋
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          title="Close"
          className="opacity-80 hover:opacity-100 transition-opacity p-1 rounded leading-none"
          style={{ color: buttonTextColor }}
        >
          ✕
        </button>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
        {messages.length === 0 && streamingContent === null && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-700 rounded-xl rounded-bl-none px-3 py-2 flex items-center gap-2">
              {aiLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aiLogo}
                  alt=""
                  style={{ width: aiLogoSize, height: aiLogoSize }}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="text-lg">🤖</span>
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
                <span className="text-lg flex-shrink-0">🤖</span>
              )
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
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
              <span className="text-lg flex-shrink-0">🤖</span>
            )}
            <div
              className="max-w-[80%] px-3 py-2 rounded-xl rounded-bl-none text-sm bg-slate-100 text-slate-700"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            disabled={isStreaming}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FloatingChatBlock({ data }: { data: BlockData }) {
  const position = getFieldValue(data, "Position", "right");
  const buttonColor = getFieldValue(data, "ButtonColor", "#2563EB");
  const buttonTextColor = getFieldValue(data, "ButtonTextColor", "#ffffff");
  const buttonIcon = getFieldValue(data, "ButtonIcon", "💬");
  const buttonSize = getFieldValue(data, "ButtonSize", "56px");
  const aiProvider = getFieldValue(data, "AiProvider", "auto");
  const customPrompt = getFieldValue(data, "CustomPrompt");
  const welcomeMessage = getFieldValue(data, "WelcomeMessage", "Hello! How can I help you?");
  const logo = getFieldValue(data, "Logo");
  const logoSize = getFieldValue(data, "LogoSize", "28px");
  const aiLogo = getFieldValue(data, "AiLogo");
  const aiLogoSize = getFieldValue(data, "AiLogoSize", "24px");

  const [isOpen, setIsOpen] = useState(false);

  const isRight = position !== "left";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        ...(isRight ? { right: "1.5rem" } : { left: "1.5rem" }),
        zIndex: 9999,
      }}
    >
      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: `calc(${buttonSize} + 0.75rem)`,
            ...(isRight ? { right: 0 } : { left: 0 }),
          }}
        >
          <ChatPanel
            customPrompt={customPrompt}
            aiProvider={aiProvider}
            welcomeMessage={welcomeMessage}
            logo={logo}
            logoSize={logoSize}
            aiLogo={aiLogo}
            aiLogoSize={aiLogoSize}
            buttonColor={buttonColor}
            buttonTextColor={buttonTextColor}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        title={isOpen ? "Close chat" : "Open chat"}
        style={{
          width: buttonSize,
          height: buttonSize,
          backgroundColor: buttonColor,
          color: buttonTextColor,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(0,0,0,0.24)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.18)";
        }}
      >
        {isOpen ? "✕" : buttonIcon}
      </button>
    </div>
  );
}
