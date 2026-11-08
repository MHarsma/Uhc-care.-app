"use client";

import * as React from "react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Heart,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const DEFAULT_SUGGESTIONS = [
  "🌸 What foods help most with menstrual cramps?",
  "🧘 Suggest a 10-min stretch for lower back tension",
  "🏋️ Can I do heavy squats during my luteal phase?",
  "💧 What helps reduce pre-period bloating?",
];

export function CareAIChatDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your UHC Care wellness & cycle companion. Ask me anything about your cycle, hormone-friendly nutrition, workout form, or gentle stretches for today.",
      time: "Just now",
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "I'm having a brief connection pause. Please try asking again in a moment!",
        time: "Now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Conversation cleared! How can I support your routine or wellness right now?",
        time: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER PILL ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6",
          "group flex items-center gap-2.5 rounded-full border border-violet-500/40 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 shadow-xl shadow-violet-500/25 transition duration-300 hover:scale-105 hover:shadow-violet-500/40",
          isOpen && "hidden",
        )}
        aria-label="Open Care AI Companion"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        <Sparkles className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white tracking-wide">
          Care AI
        </span>
      </button>

      {/* ── SLIDE-OVER CHAT DRAWER ───────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-4 bg-[var(--bg-card)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-rose-500 text-white shadow-md shadow-violet-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                      UHC Care AI
                    </h3>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                      Gemini Online
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Cycle, Diet & Fitness Companion
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  className="rounded-xl p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Disclaimer strip */}
            <div className="border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 px-4 py-2 text-[10px] text-[var(--text-tertiary)] text-center">
              Wellness companion guidance only • Not medical advice
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 text-xs leading-relaxed",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 mt-1">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-4 py-3 shadow-sm",
                        isUser
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs"
                          : "border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-xs whitespace-pre-line",
                      )}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={cn(
                          "mt-1 block text-[9px]",
                          isUser ? "text-white/60 text-right" : "text-[var(--text-tertiary)]",
                        )}
                      >
                        {msg.time}
                      </span>
                    </div>
                    {isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white mt-1">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-[var(--text-tertiary)]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <span className="italic">Thinking for you...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 2 && (
              <div className="border-t border-[var(--glass-border)] bg-[var(--bg-card)]/50 p-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-1">
                  Quick Questions:
                </p>
                <div className="flex flex-col gap-1.5">
                  {DEFAULT_SUGGESTIONS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSend(chip)}
                      className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-3 py-2 text-left text-[11px] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:text-[var(--text-primary)]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-[var(--glass-border)] p-3 bg-[var(--bg-card)]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about cycle, food, exercises..."
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-4 py-3 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-40 shadow-md shadow-violet-500/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

