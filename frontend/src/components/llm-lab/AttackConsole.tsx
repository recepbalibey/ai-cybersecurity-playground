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
          <Bot className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            {application}
          </h2>
        </div>
        <span
          className={`text-[0.6875rem] font-mono px-2.5 py-1 rounded font-bold uppercase ${
            mode === "protected"
              ? "bg-status-success/10 text-status-success border border-emerald-500/40"
              : "bg-status-danger/10 text-status-danger border border-red-500/40"
          }`}
        >
          {mode === "protected" ? "Protected" : "Vulnerable"}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* System Prompt (hidden info panel) */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none px-3.5 py-2.5 bg-cyber-base/80 border border-cyber-border rounded-lg text-xs font-mono text-cyber-muted">
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-accent" />
              View System Configuration
            </span>
            <span className="text-[0.625rem] text-accent font-semibold group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="mt-2 px-3.5 py-3 bg-cyber-base/90 border border-cyber-border rounded-lg">
            <div className="text-[0.625rem] font-bold text-accent font-mono uppercase mb-1.5">
              System Prompt
            </div>
            <p className="text-xs text-cyber-text leading-relaxed font-mono">
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
            className="w-full h-11 pl-11 pr-24 bg-cyber-base border border-cyber-border/80 rounded-lg text-sm text-cyber-heading placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <TerminalSquare className="w-4 h-4 text-cyber-muted absolute left-4 top-3.5" />
          <button
            type="submit"
            disabled={isProcessing || !payload.trim()}
            className={`absolute right-2 top-1.5 h-8 px-4 rounded-md text-[0.6875rem] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              isProcessing || !payload.trim()
                ? "bg-cyber-surface-hover text-cyber-muted cursor-not-allowed border border-cyber-border"
                : mode === "protected"
                ? "bg-emerald-600 hover:bg-emerald-500 text-on-accent shadow-emerald-glow cursor-pointer"
                : "bg-cyan-600 hover:bg-cyan-500 text-on-accent shadow-cyan-glow cursor-pointer"
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
              className="px-2.5 py-1.5 bg-cyber-base/70 hover:bg-cyber-base border border-cyber-border hover:border-red-500/50 rounded-md text-[0.625rem] font-mono text-cyber-text hover:text-status-danger transition-all text-left"
            >
              {p.length > 48 ? p.slice(0, 48) + "..." : p}
            </button>
          ))}
        </div>

        {/* Result */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-accent/10 border border-cyan-500/30 rounded-lg text-xs font-mono text-accent">
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
                  ? "bg-status-danger/10 border-red-500/50"
                  : result.status === "BLOCKED"
                  ? "bg-status-success/10 border-emerald-500/50"
                  : "bg-cyber-base/60 border-cyber-border"
              }`}
            >
              {result.status === "SUCCESS" ? (
                <ShieldAlert className="w-5 h-5 text-status-danger shrink-0" />
              ) : result.status === "BLOCKED" ? (
                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-cyber-muted shrink-0" />
              )}
              <div>
                <div className="text-sm font-bold font-mono uppercase tracking-wider mb-1">
                  <span
                    className={
                      result.status === "SUCCESS"
                        ? "text-status-danger"
                        : result.status === "BLOCKED"
                        ? "text-status-success"
                        : "text-cyber-muted"
                    }
                  >
                    Attack Status: {result.status}
                  </span>
                </div>
                <p className="text-xs text-cyber-text leading-relaxed">
                  {result.reason}
                </p>
              </div>
            </div>

            {/* Model Response */}
            <div className="p-3.5 bg-cyber-base/80 border border-cyber-border rounded-lg">
              <div className="text-[0.625rem] font-bold text-accent font-mono uppercase mb-1.5">
                Model Response
              </div>
              <p className="text-sm text-cyber-text leading-relaxed">
                {result.response}
              </p>
            </div>

            {/* Detected Signals (protected only) */}
            {result.detectedSignals.length > 0 && (
              <div className="p-3.5 bg-cyber-base/80 border border-cyber-border rounded-lg">
                <div className="text-[0.625rem] font-bold text-status-warning font-mono uppercase mb-1.5">
                  Detected Signals
                </div>
                <ul className="space-y-1">
                  {result.detectedSignals.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-cyber-text">
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