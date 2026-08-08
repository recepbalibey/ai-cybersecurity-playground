"use client";

import React from "react";
import { CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import type { LabBrief } from "@/data/labBriefData";

interface LabCompletionProps {
  brief: LabBrief;
  onRetry: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

export function LabCompletion({ brief, onRetry, onNext, nextLabel }: LabCompletionProps) {
  return (
    <div className="cyber-panel border border-emerald-500/30 p-6 rounded-lg space-y-5" role="status">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
            Mission Complete
          </p>
          <h3 className="text-base font-bold text-cyber-heading">{brief.title}</h3>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
          What you learned
        </p>
        <ul className="space-y-1.5">
          {brief.whatYouLearned.map((l) => (
            <li key={l} className="flex items-start gap-2 text-[13px] text-cyber-text">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.75} />
              {l}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-cyber-border pt-4">
        <button
          type="button"
          onClick={onRetry}
          className="flex h-9 items-center gap-2 rounded-md border border-cyber-border px-4 text-xs font-semibold text-cyber-text transition-colors hover:border-cyber-border-light hover:text-cyber-heading"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          Try the lab again
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-cyber-base transition-colors hover:bg-accent-hover"
          >
            {nextLabel ?? "Continue to next lab"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
