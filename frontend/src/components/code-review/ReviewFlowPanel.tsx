"use client";

import React from "react";
import { Radar, Check, Loader2 } from "lucide-react";
import type { WorkflowStage } from "@/services/securityCodeReviewer";

interface Props {
  stages: WorkflowStage[];
  active: boolean;
  done: boolean;
}

export function ReviewFlowPanel({ stages, active, done }: Props) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Radar className="w-4 h-4 text-violet-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Analysis Pipeline</h3>
      </div>

      <div className="relative">
        {active && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing patterns...
            </div>
          </div>
        )}
        <ol className="space-y-2">
          {stages.map((s) => (
            <li key={s.step} className="flex items-start gap-3">
              <span
                className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                  done ? "border-emerald-500/60 text-emerald-300" : "border-slate-600 text-slate-500"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : <span className="text-[9px] font-mono">{s.step}</span>}
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-cyber-heading">{s.name}</div>
                <div className="text-[11px] text-cyber-muted">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}