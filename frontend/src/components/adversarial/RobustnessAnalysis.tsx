"use client";

import React from "react";
import { ShieldAlert, Sparkles, CheckCircle2, Activity } from "lucide-react";
import { VisionAnalysisResult } from "@/services/visionSecurity";

interface RobustnessAnalysisProps {
  result: VisionAnalysisResult | null;
  isProcessing: boolean;
}

export function RobustnessAnalysis({ result, isProcessing }: RobustnessAnalysisProps) {
  if (isProcessing) {
    return (
      <div className="cyber-panel border border-cyber-border p-5 rounded-lg flex flex-col items-center justify-center gap-3 min-h-[220px]">
        <span className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-cyber-muted animate-pulse">Evaluating robustness…</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="cyber-panel border border-cyber-border p-5 rounded-lg flex flex-col items-center justify-center gap-3 min-h-[220px]">
        <span className="text-xs font-mono text-cyber-muted">Run an experiment to inspect robustness and the decision timeline.</span>
      </div>
    );
  }

  const statusCls =
    result.outcome === "blocked" || result.outcome === "defended"
      ? "border-emerald-500/50 text-emerald-400 bg-emerald-950/40"
      : result.outcome === "misclassified"
      ? "border-rose-500/50 text-rose-400 bg-rose-950/40"
      : "border-slate-600 text-slate-300 bg-slate-900";

  return (
    <div className="cyber-panel border border-cyber-border p-5 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Robustness Analysis
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-1 rounded border ${statusCls}`}>
          {result.outcome.toUpperCase()}
        </span>
      </div>

      {/* robustness gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-cyber-muted uppercase">Robustness score</span>
          <span className="text-sm font-bold font-mono text-cyber-heading">{result.robustness}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              result.robustness >= 70 ? "bg-emerald-500" : result.robustness >= 45 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${result.robustness}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-mono text-cyber-muted">
          <span>0 - VULNERABLE</span>
          <span>100 - HARDENED</span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-md">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyber-muted uppercase">What happened</span>
          </div>
          <p className="text-xs text-cyber-text leading-relaxed">{result.explanation}</p>
        </div>

        {result.outcome === "misclassified" && (
          <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-md">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] font-mono text-rose-300 uppercase">Why it failed</span>
            </div>
            <p className="text-xs text-cyber-text leading-relaxed">{result.why_failed}</p>
            <div className="mt-2 pt-2 border-t border-rose-500/20">
              <div className="text-[10px] font-mono text-rose-300 uppercase mb-1">Mitigations</div>
              <p className="text-xs text-cyber-text leading-relaxed">{result.mitigations}</p>
            </div>
          </div>
        )}

        {result.outcome === "blocked" || result.outcome === "defended" ? (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-md">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-300 uppercase">Guardrail held</span>
            </div>
            <p className="text-xs text-cyber-text leading-relaxed">
              {result.outcome === "defended"
                ? "Adversarial training kept the model on the correct class. This often costs a little clean accuracy - a deliberate, measurable trade-off."
                : "The input was recognized as adversarial and the prediction was rejected before it could be trusted."}
            </p>
          </div>
        ) : null}

        {/* mitigation suggestions for clean */}
        {result.outcome === "clean" && (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-md">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyber-muted uppercase">Baseline</span>
            </div>
            <p className="text-xs text-cyber-text leading-relaxed">
              Clean input only. Switch to <span className="text-cyan-300">adversarial</span> mode to craft an attack and see how far the boundary can be pushed.
            </p>
          </div>
        )}

        {/* Inference timeline */}
        <div>
          <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider mb-2">
            Model Decision Timeline
          </div>
          <div className="space-y-1">
            {result.timeline.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/70 border border-cyan-400" />
                <span className="text-[11px] font-mono text-cyber-text w-40 shrink-0">{t.stage}</span>
                <span className="text-[10px] font-mono text-cyber-muted truncate">{t.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}