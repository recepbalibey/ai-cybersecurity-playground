"use client";

import React from "react";
import { AlertTriangle, Target, ShieldAlert } from "lucide-react";
import type { AiFailureScenario } from "@/data/aiFailures";

interface ScenarioSelectorProps {
  scenarios: AiFailureScenario[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  beginner: "bg-status-success/10 border-emerald-500/50 text-status-success",
  intermediate: "bg-status-warning/10 border-amber-500/50 text-status-warning",
  advanced: "bg-status-danger/10 border-red-500/50 text-status-danger",
};

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
}: ScenarioSelectorProps) {
  const standard = scenarios.filter((s) => !s.capstone_events);
  const capstone = scenarios.filter((s) => s.capstone_events);

  const renderCard = (s: AiFailureScenario) => {
    const isSelected = s.id === selectedId;
    return (
      <button
        key={s.id}
        onClick={() => onSelect(s.id)}
        className={`text-left rounded-lg border p-4 transition-all flex flex-col gap-2 ${
          isSelected
            ? "bg-accent/10 border-cyan-500/60 shadow-cyan-glow"
            : "bg-cyber-base/80 border-cyber-border hover:border-cyber-border"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-cyber-heading leading-snug">{s.title}</h3>
          <span className={`shrink-0 text-[0.625rem] font-mono px-2 py-0.5 rounded border ${DIFFICULTY_STYLE[s.difficulty] ?? ""}`}>
            {s.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-cyber-muted">
          <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
          {s.failure_type.replace(/_/g, " ")}
        </div>
        <p className="text-[0.75rem] text-cyber-muted leading-snug">{s.category}</p>
        {isSelected && (
          <div className="flex items-center gap-1.5 text-[0.6875rem] font-bold text-accent">
            <ShieldAlert className="w-3.5 h-3.5" /> Selected for the failure lab
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[0.8125rem] text-cyber-text flex items-start gap-2.5">
        <Target className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <p>
          One lesson drives every screen here: <span className="font-mono text-accent">AI output is not automatically correct.</span>
          Pick a failure scenario, judge the AI, see the truth, and choose mitigations that raise reliability.
        </p>
      </div>

      <div>
        <div className="text-[0.6875rem] font-mono uppercase tracking-widest text-cyber-muted mb-2">
          Failure scenarios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {standard.map(renderCard)}
        </div>
      </div>

      {capstone.length > 0 && (
        <div>
          <div className="text-[0.6875rem] font-mono uppercase tracking-widest text-accent mb-2">
            Capstone: AI SOC Analyst Under Pressure
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {capstone.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
