"use client";

import React from "react";
import {
  GitCompareArrows,
  ShieldCheck,
  ShieldAlert,
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
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <GitCompareArrows className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Side-by-Side States
          </h2>
        </div>
        <span className="text-[0.6875rem] text-cyber-muted font-mono uppercase">
          Vulnerable vs Protected
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-start gap-2 px-1 pb-2 border-b border-cyber-border">
          <Terminal className="w-3.5 h-3.5 text-status-danger mt-0.5 shrink-0" />
          <div>
            <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-1">
              Injected Payload
            </div>
            <p className="text-xs text-cyber-text font-mono break-all">
              {payload || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Vulnerable */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-status-danger" />
              <span className="text-[0.6875rem] font-bold text-status-danger uppercase font-mono">
                Vulnerable App
              </span>
            </div>
            {compareSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded border bg-cyber-base/60 border-cyber-border ${
                  step.breach ? "text-status-danger" : "text-cyber-text"
                }`}
              >
                <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-0.5">
                  Step {idx + 1}
                </div>
                <div className="text-[0.6875rem] font-mono leading-snug break-words">
                  {step.vulnerableState}
                </div>
              </div>
            ))}
          </div>

          {/* Protected */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
              <span className="text-[0.6875rem] font-bold text-status-success uppercase font-mono">
                Protected App
              </span>
            </div>
            {compareSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-cyber-border bg-cyber-base/60"
              >
                <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-0.5">
                  Step {idx + 1}
                </div>
                <div
                  className={`text-[0.6875rem] font-mono leading-snug break-words ${
                    step.vulnerableState.includes("Unsafe function executed")
                      ? "text-cyber-muted line-through"
                      : step.blocked
                      ? "line-through text-cyber-muted"
                      : `${
                          step.blocked ? "" : "text-status-success"
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
          <div className="text-center text-xs font-mono text-accent animate-pulse">
            Comparing model states...
          </div>
        )}
      </div>
    </div>
  );
}