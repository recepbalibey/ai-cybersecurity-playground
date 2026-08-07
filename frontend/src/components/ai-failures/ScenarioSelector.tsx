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
  beginner: "bg-emerald-950/40 border-emerald-500/50 text-emerald-300",
  intermediate: "bg-amber-950/40 border-amber-500/50 text-amber-300",
  advanced: "bg-red-950/40 border-red-500/50 text-red-300",
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
            ? "bg-cyan-950/40 border-cyan-500/60 shadow-cyan-glow"
            : "bg-slate-950/80 border-cyber-border hover:border-slate-500"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-cyber-heading leading-snug">{s.title}</h3>
          <span className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded border ${DIFFICULTY_STYLE[s.difficulty] ?? ""}`}>
            {s.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          {s.failure_type.replace(/_/g, " ")}
        </div>
        <p className="text-[12px] text-cyber-muted leading-snug">{s.category}</p>
        {isSelected && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
            <ShieldAlert className="w-3.5 h-3.5" /> Selected for the failure lab
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[13px] text-cyan-100/90 flex items-start gap-2.5">
        <Target className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p>
          One lesson drives every screen here: <span className="font-mono text-cyan-300">AI output is not automatically correct.</span>
          Pick a failure scenario, judge the AI, see the truth, and choose mitigations that raise reliability.
        </p>
      </div>

      <div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-cyber-muted mb-2">
          Failure scenarios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {standard.map(renderCard)}
        </div>
      </div>

      {capstone.length > 0 && (
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
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
