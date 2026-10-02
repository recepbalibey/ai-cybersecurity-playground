"use client";

import React from "react";
import { ClipboardCheck, ScanSearch, Cpu, FileBarChart, Loader2, Check } from "lucide-react";
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
          <FileBarChart className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Security Assessment Timeline
          </h2>
        </div>
        {isProcessing && (
          <span className="flex items-center gap-1.5 text-[0.6875rem] font-mono text-accent">
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
                    ? "bg-status-success/10 text-status-success border-emerald-500/40"
                    : "bg-cyber-base text-cyber-muted border-cyber-border"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-cyber-heading">{s.stage}</div>
                <div className="text-[0.6875rem] text-cyber-muted mt-0.5">{s.detail}</div>
              </div>
              <span
                className={`text-[0.625rem] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  isProcessing
                    ? "bg-status-success/10 text-status-success border border-emerald-500/40"
                    : "bg-cyber-base text-cyber-muted border border-cyber-border"
                }`}
              >
                <Check className="w-3 h-3" aria-label="Complete" />
              </span>
            </div>
          );
        })}
        {stages.length >= 4 && (
          <div className="mx-4 h-8 border-l-2 border-dashed border-cyber-border ml-[16px]" />
        )}
      </div>
    </div>
  );
}