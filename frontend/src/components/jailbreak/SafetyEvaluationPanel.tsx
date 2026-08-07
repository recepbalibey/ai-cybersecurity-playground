"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Crosshair,
  Percent,
  GitCommitHorizontal,
} from "lucide-react";
import { EvaluationResult } from "@/services/jailbreakEvaluator";

interface SafetyEvaluationPanelProps {
  result: EvaluationResult | null;
  modelName: string;
  modelVersion: string;
  baseScore: number;
  isProcessing: boolean;
}

export function SafetyEvaluationPanel({
  result,
  modelName,
  modelVersion,
  baseScore,
  isProcessing,
}: SafetyEvaluationPanelProps) {
  const score = result?.safety_score ?? baseScore;
  const ringColor =
    score >= 80 ? "stroke-emerald-400" : score >= 50 ? "stroke-amber-400" : "stroke-red-400";

  const riskColor =
    result?.risk_level === "high"
      ? "bg-red-950/60 text-red-400 border border-red-500/40"
      : result?.risk_level === "medium"
      ? "bg-amber-950/60 text-amber-400 border border-amber-500/40"
      : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40";

  const behavior = result
    ? result.model_behavior === "refused"
      ? "Refused"
      : result.model_behavior === "compromised"
      ? "Compromised"
      : "Normal"
    : "—";

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60">
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Safety Evaluation
          </h2>
        </div>
        <div className="text-xs text-cyber-muted font-mono uppercase tracking-wide">
          {modelName} <span className="text-slate-600">//</span> {modelVersion}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Score ring */}
        <div className="flex items-center gap-5 p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 120 120" className="w-24 h-24 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                className={`${ringColor} transition-all duration-700`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-cyber-heading">{score}</span>
              <span className="text-[10px] text-cyber-muted font-mono uppercase">Safety</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Attack Technique</div>
              <div className="text-sm font-semibold text-cyber-heading">
                {result?.attack_analysis.technique ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Risk Level</div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${riskColor}`}>
                {result ? result.risk_level.toUpperCase() : "—"}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Model Behavior</div>
              <div className="text-sm font-semibold">
                <span
                  className={
                    behavior === "Compromised"
                      ? "text-red-400"
                      : behavior === "Refused"
                      ? "text-emerald-400"
                      : "text-slate-300"
                  }
                >
                  {behavior}
                </span>
                <span className="text-xs text-slate-500 ml-2 font-mono">
                  ({result?.model_behavior === "refused" ? "guardrail held" : result?.model_behavior === "compromised" ? "guardrail bypassed" : "normal operation"})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Model Behavior
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {result ? result.attack_analysis.why_worked_or_failed : "Run an evaluation to see the safety verdict and what the guardrail decided."}
          </p>
        </div>

        {/* Detected signals */}
        {(result?.signals_detected.length ?? 0) > 0 && (
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
                Signals Detected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result!.signals_detected.map((s, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-500/30"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Teaching note */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <GitCommitHorizontal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Lesson
            </span>
          </div>
          {result ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-emerald-200">{result.lesson.headline}</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{result.lesson.explanation}</p>
              <p className="text-[11px] text-emerald-300 font-mono">{result.lesson.safety_lesson}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Teachable insight will appear after an evaluation completes.
            </p>
          )}
        </div>

        {isProcessing && (
          <div className="text-center text-xs font-mono text-cyan-300 animate-pulse">
            Evaluating model safety...
          </div>
        )}
      </div>
    </div>
  );
}