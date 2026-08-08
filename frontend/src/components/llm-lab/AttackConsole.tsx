"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  TerminalSquare,
  KeyRound,
} from "lucide-react";
import { LabMode, LLMSimulationResult } from "@/services/llmSecuritySimulator";

interface AttackConsoleProps {
  application: string;
  systemPrompt: string;
  mode: LabMode;
  payloads: string[];
  result: LLMSimulationResult | null;
  isProcessing: boolean;
  onRunAttack: (payload: string) => void;
}

export function AttackConsole({
  application,
  systemPrompt,
  mode,
  payloads,
  result,
  isProcessing,
  onRunAttack,
}: AttackConsoleProps) {
  const [payload, setPayload] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payload.trim() && !isProcessing) {
      onRunAttack(payload.trim());
    }
  };

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            {application}
          </h2>
        </div>
        <span
          className={`text-[11px] font-mono px-2.5 py-1 rounded font-bold uppercase ${
            mode === "protected"
              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
              : "bg-red-950/60 text-red-400 border border-red-500/40"
          }`}
        >
          {mode === "protected" ? "Protected" : "Vulnerable"}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* System Prompt (hidden info panel) */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-cyber-muted">
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              View System Configuration
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="mt-2 px-3.5 py-3 bg-slate-950/90 border border-slate-800 rounded-lg">
            <div className="text-[10px] font-bold text-cyan-400 font-mono uppercase mb-1.5">
              System Prompt
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {systemPrompt}
            </p>
          </div>
        </details>

        {/* Attack Input */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Enter your prompt / attack..."
            className="w-full h-11 pl-11 pr-24 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-cyber-heading placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <TerminalSquare className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <button
            type="submit"
            disabled={isProcessing || !payload.trim()}
            className={`absolute right-2 top-1.5 h-8 px-4 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              isProcessing || !payload.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : mode === "protected"
                ? "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-glow cursor-pointer"
                : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-glow cursor-pointer"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Run
          </button>
        </form>

        {/* Example Payloads */}
        <div className="flex flex-wrap gap-2">
          {payloads.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onRunAttack(p)}
              disabled={isProcessing}
              className="px-2.5 py-1.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-md text-[10px] font-mono text-slate-300 hover:text-red-300 transition-all text-left"
            >
              {p.length > 48 ? p.slice(0, 48) + "..." : p}
            </button>
          ))}
        </div>

        {/* Result */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Model generating response...
          </div>
        )}

        {!isProcessing && result && (
          <div className="space-y-3">
            {/* Status */}
            <div
              className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                result.status === "SUCCESS"
                  ? "bg-red-950/30 border-red-500/50"
                  : result.status === "BLOCKED"
                  ? "bg-emerald-950/30 border-emerald-500/50"
                  : "bg-slate-950/60 border-slate-700"
              }`}
            >
              {result.status === "SUCCESS" ? (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              ) : result.status === "BLOCKED" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <div>
                <div className="text-sm font-bold font-mono uppercase tracking-wider mb-1">
                  <span
                    className={
                      result.status === "SUCCESS"
                        ? "text-red-400"
                        : result.status === "BLOCKED"
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }
                  >
                    Attack Status: {result.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.reason}
                </p>
              </div>
            </div>

            {/* Model Response */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] font-bold text-cyan-400 font-mono uppercase mb-1.5">
                Model Response
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {result.response}
              </p>
            </div>

            {/* Detected Signals (protected only) */}
            {result.detectedSignals.length > 0 && (
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                <div className="text-[10px] font-bold text-amber-400 font-mono uppercase mb-1.5">
                  Detected Signals
                </div>
                <ul className="space-y-1">
                  {result.detectedSignals.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/70 mt-1.5 shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}