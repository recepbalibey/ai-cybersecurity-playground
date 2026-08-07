"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, ShieldQuestion } from "lucide-react";
import { askPrivacy } from "@/services/privacyScanner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What makes data sensitive?",
  "Why is PII risky to send to AI?",
  "How do DLP policies work?",
  "What is prompt hygiene?",
];

export function PrivacyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: askPrivacy(q) }]);
      setTyping(false);
    }, 500);
  };

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <Bot className="w-4 h-4 text-violet-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Privacy Assistant</h3>
        <span className="ml-auto text-[10px] font-mono text-cyber-muted flex items-center gap-1">
          <ShieldQuestion className="w-3 h-3" /> Ask a question
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-3 min-h-[240px]">
        {messages.length === 0 && (
          <div className="space-y-1.5">
            <p className="text-[12px] text-cyber-muted leading-snug">
              Ask about PII, secrets, data classification, DLP policies, redaction, or prompt hygiene.
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left px-3 py-2 rounded-md border border-cyber-border text-[11px] font-mono text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-[12px] leading-relaxed ${
                m.role === "user"
                  ? "bg-cyan-600/20 border border-cyan-500/30 text-cyan-100"
                  : "bg-slate-800/70 border border-cyber-border text-cyber-heading/90"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-slate-800/70 border border-cyber-border text-[12px] text-slate-400">
              thinking...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-2 border-t border-cyber-border flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about protecting data before AI..."
          className="flex-1 h-9 px-3 rounded-md bg-slate-900 border border-cyber-border text-[12px] text-cyber-heading placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="h-9 px-3 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-slate-950 flex items-center gap-1.5 text-xs font-bold"
        >
          <Send className="w-3.5 h-3.5" />
          Ask
        </button>
      </form>
    </div>
  );
}
