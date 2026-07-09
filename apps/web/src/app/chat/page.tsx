"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Send, Bot, User } from "lucide-react";
import type { SearchResult } from "@kb/shared";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[];
  streaming?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("kb_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("kb_chat_history", JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    setError("");

    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      await api.chat.askStream(question, history, {
        onSources: (sources) => {
          setMessages((prev) => {
            const next = [...prev];
            if (next[assistantIndex]) {
              next[assistantIndex] = { ...next[assistantIndex], sources };
            }
            return next;
          });
        },
        onToken: (token) => {
          setMessages((prev) => {
            const next = [...prev];
            if (next[assistantIndex]) {
              next[assistantIndex] = {
                ...next[assistantIndex],
                content: next[assistantIndex].content + token,
              };
            }
            return next;
          });
        },
        onDone: () => {
          setMessages((prev) => {
            const next = [...prev];
            if (next[assistantIndex]) {
              next[assistantIndex] = { ...next[assistantIndex], streaming: false };
            }
            return next;
          });
        },
        onError: (msg) => setError(msg),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hỏi đáp thất bại");
      setMessages((prev) => prev.filter((_, i) => i !== assistantIndex));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hỏi đáp AI</h1>
          <p className="text-sm text-muted">
            Hybrid search (FTS + Vector) · Streaming responses
          </p>
        </div>
        {isMounted && messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              localStorage.removeItem("kb_chat_history");
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-elevated text-red-500 hover:text-red-600 transition-colors"
          >
            Xóa lịch sử
          </button>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-auto rounded-xl border border-border bg-surface p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-muted">
            <Bot size={48} className="mb-4 text-accent/50" />
            <p>Hỏi bất cứ điều gì về ghi chú và tài liệu nội bộ.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && <Bot size={20} className="mt-1 shrink-0 text-accent" />}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user" ? "bg-accent text-black" : "bg-surface-elevated"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.content ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <span className="text-muted">…</span>
                )
              ) : (
                <p>{msg.content}</p>
              )}
              {msg.sources && msg.sources.length > 0 && !msg.streaming && (
                <div className="mt-3 border-t border-border pt-2">
                  <p className="mb-1 text-xs text-muted">Nguồn tham khảo:</p>
                  {msg.sources.map((s, j) => (
                    <p key={j} className="text-xs">
                      <Link href={`/notes/${s.note_id}`} className="text-accent hover:underline">
                        {s.title}
                      </Link>{" "}
                      <span className="text-muted">(điểm: {s.score.toFixed(3)})</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && <User size={20} className="mt-1 shrink-0 text-muted" />}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Bot size={16} className="text-accent" />
            Đang tìm kiếm ngữ cảnh...
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Đặt câu hỏi..."
          className="flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover"
        >
          <Send size={16} />
          Gửi
        </button>
      </form>
    </div>
  );
}
