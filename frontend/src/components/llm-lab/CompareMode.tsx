"use client";

import React from "react";
import {
  GitCompareArrows,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { CompareStep } from "@/services/llmSecuritySimulator";

interface CompareModeProps {
  compareSteps: CompareStep[];
  payload: string;
  isProcessing: boolean;
}

export function CompareMode({
  compareSteps,
  payload,
  isProcessing,
}: CompareModeProps) {
  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GitCompareArrows className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Side-by-Side States
          </h2>
        </div>
        <span className="text-[11px] text-cyber-muted font-mono uppercase">
          Vulnerable vs Protected
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-start gap-2 px-1 pb-2 border-b border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-mono text-cyber-muted uppercase mb-1">
              Injected Payload
            </div>
            <p className="text-xs text-slate-200 font-mono break-all">
              {payload || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Vulnerable */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-bold text-red-300 uppercase font-mono">
                Vulnerable App
              </span>
            </div>
            {compareSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded border bg-slate-950/60 border-slate-800 ${
                  step.breach ? "text-red-400" : "text-slate-300"
                }`}
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                  Step {idx + 1}
                </div>
                <div className="text-[11px] font-mono leading-snug break-words">
                  {step.vulnerableState}
                </div>
              </div>
            ))}
          </div>

          {/* Protected */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-300 uppercase font-mono">
                Protected App
              </span>
            </div>
            {compareSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60"
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                  Step {idx + 1}
                </div>
                <div
                  className={`text-[11px] font-mono leading-snug break-words ${
                    step.vulnerableState.includes("Unsafe function executed")
                      ? "text-slate-500 line-through"
                      : step.blocked
                      ? "line-through text-slate-600"
                      : `${
                          step.blocked ? "" : "text-emerald-200"
                        }`
                  }`}
                >
                  {step.protectedState}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isProcessing && (
          <div className="text-center text-xs font-mono text-cyan-300 animate-pulse">
            Comparing model states...
          </div>
        )}
      </div>
    </div>
  );
}