"use client";

import React from "react";
import { CheckCircle2, Cpu, Radio } from "lucide-react";
import { ReasoningStage } from "@/services/aiAnalyst";

interface LiveInvestigationViewProps {
  stages: ReasoningStage[];
  currentStageIndex: number;
  isAnalyzing: boolean;
}

export function LiveInvestigationView({
  stages,
  currentStageIndex,
  isAnalyzing,
}: LiveInvestigationViewProps) {
  return (
    <div className="cyber-panel flex flex-col h-full border border-cyber-border overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Live AI Investigation View
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAnalyzing ? "bg-cyan-400 animate-ping" : "bg-emerald-400"
            }`}
          />
          <span className="text-xs text-cyber-muted font-mono uppercase font-semibold">
            {isAnalyzing ? "REASONING IN PROGRESS" : "ANALYSIS COMPLETE"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto bg-grid-pattern relative">
        {/* Holographic Header Telemetry */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio
              className={`w-5 h-5 ${
                isAnalyzing ? "text-cyan-400 animate-pulse" : "text-emerald-400"
              }`}
            />
            <div>
              <div className="text-sm font-semibold text-cyber-heading">
                AI Cognitive Reasoning Pipeline
              </div>
              <div className="text-xs text-cyber-muted font-mono mt-0.5">
                {isAnalyzing
                  ? "Evaluating heuristic event features & anomaly probabilities..."
                  : "All 5 reasoning stages verified & synthesized into SOC report"}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs font-bold text-cyan-400">
            {isAnalyzing
              ? `STAGE ${currentStageIndex + 1} / 5`
              : "100% COMPLETE"}
          </div>
        </div>

        {/* 5-Stage Timeline Vertical Process Pipeline */}
        <div className="flex-1 space-y-3.5 relative">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || (!isAnalyzing && stages.length > 0);
            const isCurrent = isAnalyzing && idx === currentStageIndex;

            return (
              <div
                key={stage.stage}
                className={`p-4 rounded-lg border transition-all duration-300 relative ${
                  isCurrent
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-cyan-glow"
                    : isCompleted
                    ? "bg-slate-900/60 border-slate-800/80"
                    : "bg-slate-950/30 border-slate-900/50 opacity-40"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isCurrent
                          ? "bg-cyan-500 text-slate-950 animate-pulse"
                          : isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-500"
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
                            ? "text-cyan-300"
                            : isCompleted
                            ? "text-cyber-heading"
                            : "text-slate-500"
                        }`}
                      >
                        Stage {stage.stage}: {stage.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {stage.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                  {stage.detail}
                </p>

                {/* Animated Scanner Bar for active stage */}
                {isCurrent && (
                  <div className="mt-2.5 pl-10">
                    <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden relative">
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
