"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Radar,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { DefenseLayer } from "@/services/llmSecuritySimulator";

interface SecurityAnalysisPanelProps {
  defenseLayers: DefenseLayer[];
  attackAnalysis: {
    technique: string;
    vector: string;
    successRate: string;
    riskLevel: "high" | "medium" | "low";
    notes: string[];
  } | null;
  blockers: string[];
}

function layerIcon(layer: DefenseLayer) {
  switch (layer.name) {
    case "Input Sanitization":
      return Radar;
    case "Delimiter Isolation":
      return Lock;
    case "System Boundary Hardening":
      return FileAlertBlock;
    default:
      return ShieldCheck;
  }
}

function FileAlertBlock({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M12 17h.01" />
      <path d="M12 13V9" />
    </svg>
  );
}

export function SecurityAnalysisPanel({
  defenseLayers,
  attackAnalysis,
  blockers,
}: SecurityAnalysisPanelProps) {
  const hasActiveDefenses = (defenseLayers ?? []).some((l) => l.active);

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Security Analysis
          </h2>
        </div>
        <span className="text-[11px] text-cyber-muted font-mono uppercase">
          Defense Layers
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Attack Analysis */}
        {attackAnalysis && (
          <div
            className={`p-4 rounded-lg border ${
              attackAnalysis.riskLevel === "high"
                ? "bg-red-950/30 border-red-500/50"
                : attackAnalysis.riskLevel === "medium"
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-slate-950/60 border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    attackAnalysis.riskLevel === "high"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                />
                <span className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
                  Attack Analysis
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  attackAnalysis.riskLevel === "high"
                    ? "bg-red-950/70 text-red-400 border border-red-500/40"
                    : "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                }`}
              >
                {attackAnalysis.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Technique
                </div>
                <div className="text-xs text-slate-200 font-mono">
                  {attackAnalysis.technique}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Vector
                </div>
                <div className="text-xs text-slate-200 font-mono">
                  {attackAnalysis.vector}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Success Rate
                </div>
                <div className="text-xs text-slate-200 font-mono">
                  {attackAnalysis.successRate}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {attackAnalysis.notes}
              </p>
            </div>
          </div>
        )}

        {!hasActiveDefenses && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <ShieldAlert className="w-10 h-10 text-red-400/60 mb-3" />
            <p className="text-sm text-slate-400">
              No defense layers detected.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              This application is fully vulnerable to prompt injection.
            </p>
          </div>
        )}

        {hasActiveDefenses && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-cyber-muted uppercase tracking-wider">
                Active Defense Layers
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">
                {defenseLayers.length} ACTIVE
              </span>
            </div>

            {defenseLayers.map((layer) => {
              const Icon = layerIcon(layer);
              return (
                <div
                  key={layer.name}
                  className="mb-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
                      {layer.name}
                    </span>
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    {layer.description}
                  </p>
                  <div className="space-y-1">
                    {(layer.checkerLines ?? []).map((line, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-[11px] font-mono"
                      >
                        <Radar className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span className="text-slate-400 break-all">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}