"use client";

import React from "react";
import { CheckCircle2, Cpu, Radio } from "lucide-react";
import { HuntingStep } from "@/services/threatHunter";

interface AIHuntingTimelineProps {
  timeline: HuntingStep[];
  currentStepIndex: number;
  isHunting: boolean;
}

export function AIHuntingTimeline({
  timeline,
  currentStepIndex,
  isHunting,
}: AIHuntingTimelineProps) {
  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            AI Hunting Workflow
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isHunting ? "bg-cyan-400 animate-ping" : "bg-emerald-400"
            }`}
          />
          <span className="text-xs text-cyber-muted font-mono uppercase font-semibold">
            {isHunting ? "HUNTING ENGINE ACTIVE" : "WORKFLOW VERIFIED"}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto bg-grid-pattern">
        {/* Holographic Status */}
        <div className="p-3.5 bg-cyber-base/80 border border-cyber-border rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio
              className={`w-5 h-5 ${
                isHunting ? "text-accent animate-pulse" : "text-status-success"
              }`}
            />
            <div>
              <div className="text-sm font-semibold text-cyber-heading">
                Proactive Threat Synthesis Pipeline
              </div>
              <div className="text-xs text-cyber-muted font-mono mt-0.5">
                {isHunting
                  ? "Formulating hypothesis & building SIEM detection queries..."
                  : "Threat hunting steps completed & findings extracted"}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs font-bold text-accent">
            {isHunting ? `STEP ${currentStepIndex + 1} / 5` : "COMPLETE"}
          </div>
        </div>

        {/* Packet flow rail - active during a hunt */}
        <div
          className={`packet-rail relative h-3 rounded-full border ${
            isHunting
              ? "border-cyan-500/40 bg-accent/10"
              : "border-cyber-border bg-cyber-base/40"
          }`}
        >
          <span className="packet" />
          <span className="packet packet-delay-1" />
          <span className="packet packet-delay-2" />
        </div>

        {/* 5-Step Timeline List */}
        <div className="space-y-3 relative">
          {timeline.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || (!isHunting && timeline.length > 0);
            const isCurrent = isHunting && idx === currentStepIndex;

            return (
              <div
                key={step.step}
                className={`p-3.5 rounded-lg border transition-all duration-300 relative ${
                  isCurrent
                    ? "bg-accent/10 border-cyan-500/60 shadow-cyan-glow"
                    : isCompleted
                    ? "bg-cyber-base/60 border-cyber-border/80"
                    : "bg-cyber-base/30 border-cyber-border/50 opacity-40"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isCurrent
                          ? "bg-cyan-500 text-on-accent animate-pulse"
                          : isCompleted
                          ? "bg-emerald-500/20 text-status-success border border-emerald-500/40"
                          : "bg-cyber-surface-hover text-cyber-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        step.step
                      )}
                    </div>
                    <h3
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-accent"
                          : isCompleted
                          ? "text-cyber-heading"
                          : "text-cyber-muted"
                      }`}
                    >
                      Step {step.step}: {step.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-cyber-muted">
                    {step.timestamp}
                  </span>
                </div>

                <p className="text-xs text-cyber-text pl-9 leading-relaxed">
                  {step.detail}
                </p>

                {isCurrent && (
                  <div className="mt-2 pl-9">
                    <div className="h-1 w-full bg-cyber-surface-hover rounded overflow-hidden relative">
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
