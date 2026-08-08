"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  ShieldAlert,
  MessageSquare,
  KeyRound,
} from "lucide-react";
import { EvaluationResult } from "@/services/jailbreakEvaluator";

interface ConversationSimulatorProps {
  application: string;
  systemPrompt: string;
  safetyRules: string[];
  result: EvaluationResult | null;
  isProcessing: boolean;
  onRun: (prompt: string) => void;
}

export function ConversationSimulator({
  application,
  systemPrompt,
  safetyRules,
  result,
  isProcessing,
  onRun,
}: ConversationSimulatorProps) {
  const [input, setInput] = useState("");

  const handleRun = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !isProcessing) return;
    onRun(input.trim());
  };

  const runPreset = (text: string) => {
    setInput(text);
    onRun(text);
  };

  const Card = ({
    content,
    kind,
  }: {
    content: string;
    kind: "user" | "ai" | "alert";
  }) => {
    if (kind === "user") {
      return (
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <div className="flex-1 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="text-[10px] font-bold text-cyan-400 font-mono uppercase mb-1">
              Red Team User
            </div>
            <p className="text-xs text-slate-200 leading-relaxed break-words">{content}</p>
          </div>
        </div>
      );
    }
    if (kind === "alert") {
      return (
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="flex-1 p-3 bg-red-950/20 border border-red-500/40 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-red-300 font-bold mb-1">
              Safety Layer - Request Refused
            </div>
            <p className="text-xs text-slate-200 leading-relaxed break-words">{content}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="flex-1 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">
            {application}
          </div>
          <p className="text-xs text-slate-200 leading-relaxed break-words">{content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Conversation Simulator
          </h2>
        </div>
        <span
          className={`text-[11px] font-mono px-2.5 py-1 rounded font-bold uppercase ${
            result?.status === "COMPROMISED"
              ? "alert-ping relative bg-red-950/60 text-red-400 border border-red-500/40"
              : result?.status === "BLOCKED"
              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
              : "bg-slate-900 text-slate-400 border border-slate-700"
          }`}
        >
          {result ? result.status : "IDLE"}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto bg-grid-pattern">
        {/* System prompt disclosure */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-cyber-muted">
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              View Model System Prompt
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="mt-2 px-3.5 py-3 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {systemPrompt}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {safetyRules.map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </details>

        {/* Conversation bubbles */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Model evaluating prompt through safety layer...
          </div>
        )}

{result && (
        <div className="space-y-3">
          <div className="decode-enter">
            <Card kind="user" content={result.prompt} />
          </div>
          <div className="decode-enter" style={{ animationDelay: "150ms" }}>
            <Card
              kind={result.status === "BLOCKED" ? "alert" : "ai"}
              content={result.response}
            />
          </div>
        </div>
      )}

        {!result && !isProcessing && (
          <div className="flex flex-col items-center justify-center text-center py-10 flex-1">
            <Bot className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">
              Simulated {application} assistant.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Enter an adversarial prompt or pick a test case from the library.
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyber-border space-y-2">
        <form onSubmit={handleRun} className="relative">
          <MessageSquare className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter red-team prompt..."
            className="w-full h-11 pl-11 pr-24 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-cyber-heading placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="absolute right-2 top-1.5 h-8 px-4 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-cyan-glow"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}