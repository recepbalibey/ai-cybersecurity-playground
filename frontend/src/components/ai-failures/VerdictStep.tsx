"use client";

import React from "react";
import { ThumbsUp, ThumbsDown, HelpCircle, SlidersHorizontal } from "lucide-react";
import type { StudentDecision } from "@/services/aiFailureEngine";

interface VerdictStepProps {
  decision: StudentDecision | null;
  confidence: number;
  onDecision: (d: StudentDecision) => void;
  onConfidence: (v: number) => void;
  isProcessing?: boolean;
  onSubmit: () => void;
}

export function VerdictStep({
  decision,
  confidence,
  onDecision,
  onConfidence,
  isProcessing = false,
  onSubmit,
}: VerdictStepProps) {
  const options: { value: StudentDecision; label: string; icon: typeof ThumbsUp; note: string }[] = [
    { value: "correct", label: "Correct", icon: ThumbsUp, note: "The AI got it right" },
    { value: "incorrect", label: "Incorrect", icon: ThumbsDown, note: "The AI got it wrong" },
    { value: "uncertain", label: "Uncertain", icon: HelpCircle, note: "I cannot tell" },
  ];

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Your verdict - is the AI correct?
        </h3>
      </div>
      <p className="text-[12px] text-cyber-muted mb-3">
        Commit before the ground truth is revealed. Your verdict feeds the scorecard and your trust calibration.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {options.map((o) => {
          const Icon = o.icon;
          const active = decision === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onDecision(o.value)}
              className={`rounded-md border p-3 text-left transition-all flex flex-col gap-1.5 ${
                active
                  ? "bg-cyan-950/40 border-cyan-500/60 shadow-cyan-glow"
                  : "bg-slate-950/80 border-cyber-border hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                <span className={`text-sm font-bold ${active ? "text-cyan-300" : "text-cyber-heading"}`}>
                  {o.label}
                </span>
              </div>
              <span className="text-[11px] text-cyber-muted">{o.note}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <label className="text-[11px] font-mono uppercase tracking-wider text-cyber-muted">
            How confident are you in your verdict?
          </label>
          <span className="ml-auto text-xs font-mono text-cyan-300">{confidence}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={confidence}
          onChange={(e) => onConfidence(Number(e.target.value))}
          className="w-full accent-cyan-500"
          aria-label="Confidence in verdict"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!decision || isProcessing}
        className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold transition-all"
      >
        {isProcessing ? "Evaluating…" : "Submit verdict and reveal ground truth"}
      </button>
    </div>
  );
}
