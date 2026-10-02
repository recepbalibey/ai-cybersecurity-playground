"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { AiFailureEvaluation } from "@/services/aiFailureEngine";

interface MitigationStepProps {
  result: AiFailureEvaluation;
  selected: string[];
  onToggle: (id: string) => void;
  onRetest: () => void;
  onReset: () => void;
  isProcessing?: boolean;
}

export function MitigationStep({
  result,
  selected,
  onToggle,
  onRetest,
  onReset,
  isProcessing = false,
}: MitigationStepProps) {
  const reliability = result.reliability;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[0.8125rem] text-cyber-text flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <p>
          Mitigations raise the reliability of this decision. Pick the controls that would have{" "}
          <span className="font-mono text-accent">caught this failure</span>, then retest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {result.mitigations.map((m) => {
          const active = selected.includes(m.id);
          const prevents = m.prevents.includes(result.failure_type);
          return (
            <button
              key={m.id}
              onClick={() => onToggle(m.id)}
              className={`text-left rounded-md border p-3 transition-all ${
                active
                  ? "bg-accent/10 border-cyan-500/60 shadow-cyan-glow"
                  : "bg-cyber-base/80 border-cyber-border hover:border-cyber-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-[0.8125rem] font-bold ${active ? "text-accent" : "text-cyber-heading"}`}>
                  {m.name}
                </span>
                <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded border border-cyber-border text-cyber-muted">
                  +{m.gain} reliability
                </span>
              </div>
              <p className="text-[0.6875rem] text-cyber-muted leading-snug mb-2">{m.description}</p>
              <span
                className={`text-[0.625rem] font-mono px-1.5 py-0.5 rounded ${
                  prevents ? "bg-status-success/10 text-status-success" : "bg-cyber-surface-hover/60 text-cyber-muted"
                }`}
              >
                {prevents ? "would catch this failure" : "supports the process"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Retest result */}
      <div className="cyber-panel border border-cyber-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-cyber-heading">
            Reliability retest
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[0.6875rem] font-mono text-cyber-muted">
              {reliability.before}% &rarr; {reliability.after}%
            </span>
            {reliability.caught ? (
              <span className="flex items-center gap-1 text-[0.625rem] font-mono px-2 py-0.5 rounded border border-emerald-500/40 text-status-success">
                <CheckCircle2 className="w-3 h-3" /> failure caught
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[0.625rem] font-mono px-2 py-0.5 rounded border border-red-500/40 text-status-danger">
                <XCircle className="w-3 h-3" /> still missed
              </span>
            )}
          </div>
        </div>
        <div className="h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              reliability.caught ? "bg-emerald-500" : "bg-red-500"
            }`}
            style={{ width: `${reliability.after}%` }}
          />
        </div>
        <p className="text-[0.6875rem] text-cyber-muted mt-2">
          With {selected.length} mitigation(s) selected, reliability moves from {reliability.before}/100 to {reliability.after}/100.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onRetest}
          disabled={isProcessing}
          className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-on-accent text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> {isProcessing ? "Retesting…" : "Retest reliability"}
        </button>
        <button
          onClick={onReset}
          className="px-4 h-9 rounded-md border border-cyber-border text-cyber-text hover:border-cyan-500/60 hover:text-accent text-xs font-semibold transition-all"
        >
          New scenario
        </button>
      </div>
    </div>
  );
}
