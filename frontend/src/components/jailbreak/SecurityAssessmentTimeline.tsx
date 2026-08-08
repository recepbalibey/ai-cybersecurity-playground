"use client";

import React from "react";
import { ClipboardCheck, ScanSearch, Cpu, FileBarChart, Loader2 } from "lucide-react";
import { TimelineStage } from "@/services/jailbreakEvaluator";

interface SecurityAssessmentTimelineProps {
  stages: TimelineStage[];
  isProcessing: boolean;
}

const stageIcons = [ClipboardCheck, ScanSearch, Cpu, FileBarChart];

export function SecurityAssessmentTimeline({
  stages,
  isProcessing,
}: SecurityAssessmentTimelineProps) {
  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <FileBarChart className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Security Assessment Timeline
          </h2>
        </div>
        {isProcessing && (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> RUNNING
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-evenly gap-1 overflow-y-auto">
        {stages.map((s, idx) => {
          const Icon = stageIcons[idx] ?? ClipboardCheck;
          return (
            <div key={idx} className="flex items-center gap-3 py-1">
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                  isProcessing
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-cyber-heading">{s.stage}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.detail}</div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  isProcessing
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-900 text-slate-500 border border-slate-700"
                }`}
              >
                ✓
              </span>
            </div>
          );
        })}
        {stages.length >= 4 && (
          <div className="mx-4 h-8 border-l-2 border-dashed border-slate-700 ml-[16px]" />
        )}
      </div>
    </div>
  );
}