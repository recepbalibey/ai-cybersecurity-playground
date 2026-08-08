"use client";

import React from "react";
import { Target, BookOpen } from "lucide-react";
import type { LabBrief } from "@/data/labBriefData";
import { cn } from "@/lib/cn";

interface LabMissionProps {
  brief: LabBrief;
  currentStep?: number;
  onViewBrief: () => void;
  className?: string;
}

export function LabMission({ brief, currentStep = -1, onViewBrief, className }: LabMissionProps) {
  const steps = brief.missionSteps ?? [];
  const clampedStep = Math.min(Math.max(currentStep, 0), steps.length - 1);
  const showProgress = steps.length > 0 && currentStep >= 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Target className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.75} />
        <p className="truncate text-[12px] text-cyber-muted">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
            Mission
          </span>
          <span className="text-cyber-text">{brief.mission}</span>
        </p>
      </div>
      {showProgress && (
        <span className="hidden shrink-0 items-center gap-1.5 rounded border border-cyber-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyber-muted lg:flex">
          <span className="text-accent">{clampedStep + 1}</span>
          <span>/</span>
          <span>{steps.length}</span>
        </span>
      )}
      {showProgress && (
        <span
          className="hidden w-16 shrink-0 overflow-hidden rounded-full border border-cyber-border bg-cyber-surface-hover/60 h-1 lg:block"
          role="progressbar"
          aria-valuenow={((clampedStep + 1) / steps.length) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${brief.title} mission progress`}
        >
          <span
            className="block h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${((clampedStep + 1) / steps.length) * 100}%` }}
          />
        </span>
      )}
      <button
        type="button"
        onClick={onViewBrief}
        className="flex shrink-0 items-center gap-1.5 rounded border border-cyber-border px-2 py-1 text-[11px] text-cyber-muted transition-colors hover:border-cyber-border-light hover:text-cyber-text"
      >
        <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
        View Brief
      </button>
    </div>
  );
}
