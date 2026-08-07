"use client";

import React from "react";
import { GitCompareArrows, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import { EvaluationResult } from "@/services/jailbreakEvaluator";

interface ModelComparisonProps {
  lite: EvaluationResult | null;
  pro: EvaluationResult | null;
  isProcessing: boolean;
}

export function ModelComparison({ lite, pro, isProcessing }: ModelComparisonProps) {
  const renderCard = (model: EvaluationResult | null, accent: "lite" | "pro") => {
    if (!model) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-10 flex-1">
          <ShieldCheck className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Run a comparison to populate this model&apos;s result.</p>
        </div>
      );
    }
    const blocked = model.status === "BLOCKED";
    const compromised = model.status === "COMPROMISED";
    return (
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold font-mono text-cyber-heading uppercase tracking-wider">
              {model.model_name}
            </div>
            <div className="text-[11px] font-mono text-cyber-muted">{model.model_version}</div>
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              accent === "pro" ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {model.safety_score}%
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            blocked
              ? "bg-emerald-950/20 border-emerald-500/50"
              : compromised
              ? "bg-red-950/20 border-red-500/50"
              : "bg-slate-950/60 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {blocked ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : compromised ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-300" />
            )}
            <span
              className={`text-[11px] font-bold font-mono uppercase ${
                blocked ? "text-emerald-400" : compromised ? "text-red-400" : "text-slate-300"
              }`}
            >
              {model.model_behavior}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {model.attack_analysis.why_worked_or_failed}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {model.signals_detected.map((s, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-500/30"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                accent === "pro" ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${model.safety_score}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] font-mono text-cyber-muted uppercase">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden">
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GitCompareArrows className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Model Comparison
          </h2>
        </div>
        <span className="text-[11px] text-cyber-muted font-mono uppercase">
          Same test case, two models
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[240px]">
        <div className="p-4 rounded-lg border border-amber-500/30 bg-slate-950/50">
          {renderCard(lite, "lite")}
        </div>
        <div className="p-4 rounded-lg border border-emerald-500/30 bg-slate-950/50">
          {renderCard(pro, "pro")}
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[11px] text-cyber-muted leading-relaxed">
          Lesson: different models have different security behavior. Sentinel-Pro keeps the boundary under
          the same prompt that defeats Sentinel-Lite — evidence that safety is a property of the deployed
          model + guardrails, not of any single prompt.
        </p>
      </div>
    </div>
  );
}