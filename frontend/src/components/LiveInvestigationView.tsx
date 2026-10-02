"use client";

import React from "react";
import { CheckCircle2, Cpu, Radio } from "lucide-react";
import { ReasoningStage } from "@/services/aiAnalyst";

interface LiveInvestigationViewProps {
  hasResult?: boolean;
  stages: ReasoningStage[];
  currentStageIndex: number;
  isAnalyzing: boolean;
}

export function LiveInvestigationView({
  hasResult = false,
  stages,
  currentStageIndex,
  isAnalyzing,
}: LiveInvestigationViewProps) {
  return (
    <div className="cyber-panel flex flex-col h-full border border-cyber-border overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Analysis steps
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAnalyzing ? "bg-cyan-400 animate-ping" : "bg-emerald-400"
            }`}
          />
          <span className="text-xs text-cyber-muted font-mono uppercase font-semibold">
            {isAnalyzing ? "REASONING IN PROGRESS" : hasResult ? "Complete" : "Ready"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto bg-grid-pattern relative">
        {/* Holographic Header Telemetry */}
        <div
          className={`p-3.5 bg-cyber-base/80 border border-cyber-border rounded flex items-center justify-between holo-reticle ${
            isAnalyzing ? "border-cyan-500/40" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`relative flex h-6 w-6 items-center justify-center rounded-full ${
                isAnalyzing ? "radar-sweep radar-live" : ""
              }`}
            >
              <Radio
                className={`w-5 h-5 ${
                  isAnalyzing ? "text-accent animate-pulse" : "text-status-success"
                }`}
              />
            </span>
            <div>
              <div className="text-sm font-semibold text-cyber-heading">
                How the analysis works
              </div>
              <div className="text-xs text-cyber-muted font-mono mt-0.5">
                {isAnalyzing
                  ? "Evaluating heuristic event features & anomaly probabilities..."
                  : hasResult ? "Review the evidence and report below." : "Choose logs, then start the analysis."}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs font-bold text-accent">
            {isAnalyzing
              ? `STAGE ${currentStageIndex + 1} / 5`
              : hasResult ? "Complete" : "Not started"}
          </div>
        </div>

        {/* 5-Stage Timeline Vertical Process Pipeline */}
        <div className="flex-1 space-y-3.5 relative">
          {stages.map((stage, idx) => {
            const isCompleted = (isAnalyzing && idx < currentStageIndex) || (!isAnalyzing && hasResult);
            const isCurrent = isAnalyzing && idx === currentStageIndex;

            return (
              <div
                key={stage.stage}
                className={`p-4 rounded-lg border transition-all duration-300 relative ${
                  isCurrent
                    ? "bg-accent/10 border-cyan-500/60 shadow-cyan-glow holo-panel"
                    : isCompleted
                    ? "bg-cyber-base/60 border-cyber-border/80"
                    : "bg-cyber-base/30 border-cyber-border/50"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isCurrent
                          ? "bg-cyan-500 text-on-accent animate-pulse"
                          : isCompleted
                          ? "bg-emerald-500/20 text-status-success border border-emerald-500/40"
                          : "bg-cyber-surface-hover text-cyber-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        stage.stage
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? "text-accent"
                            : isCompleted
                            ? "text-cyber-heading"
                            : "text-cyber-muted"
                        }`}
                      >
                        Stage {stage.stage}: {stage.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyber-muted">
                    {stage.timestamp}
                  </span>
                </div>

                <p className="text-xs text-cyber-text pl-10 leading-relaxed">
                  {stage.detail}
                </p>

                {/* Animated Scanner Bar for active stage */}
                {isCurrent && (
                  <div className="mt-2.5 pl-10">
                    <div className="h-1.5 w-full bg-cyber-surface-hover rounded overflow-hidden relative">
                      <div className="h-full bg-cyan-400 animate-pulse w-2/3"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
