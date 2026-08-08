"use client";

import React from "react";
import {
  Lightbulb,
  ArrowRight,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface LearningMomentProps {
  episode: {
    what: string;
    why: string;
    tryNext?: string;
  };
  className?: string;
}

export function LearningMoment({ episode, className }: LearningMomentProps) {
  return (
    <div
      className={cn(
        "holo-panel cyber-panel border border-cyber-border rounded-lg p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-accent" strokeWidth={1.75} />
        <p className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
          What just happened
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="flex items-start gap-2 text-[13px] text-cyber-text">
          <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.75} />
          <span>{episode.what}</span>
        </p>
        <p className="flex items-start gap-2 text-[13px] text-cyber-muted">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" strokeWidth={1.75} />
          <span>{episode.why}</span>
        </p>
        {episode.tryNext && (
          <p className="flex items-start gap-2 text-[13px] text-cyber-text">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={1.75} />
            <span>{episode.tryNext}</span>
          </p>
        )}
      </div>
    </div>
  );
}