"use client";

import React from "react";
import { ShieldAlert, Target, Users, Boxes } from "lucide-react";
import type { GovernanceProject } from "@/data/governance";

interface ProjectSelectorProps {
  projects: GovernanceProject[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const CRIT_STYLE: Record<string, string> = {
  Critical: "bg-status-danger/10 border-red-500/50 text-status-danger",
  High: "bg-status-warning/10 border-amber-500/50 text-status-warning",
  Medium: "bg-accent/10 border-cyan-500/50 text-accent",
  Low: "bg-status-success/10 border-emerald-500/50 text-status-success",
};

export function ProjectSelector({
  projects,
  selectedId,
  onSelect,
  disabled,
}: ProjectSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[0.8125rem] text-cyber-text flex items-start gap-2.5">
        <Target className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <p>
          Every AI system reaches the same gate: <span className="font-mono text-accent">should we deploy this?</span>
          Choose a fictional AI project, then walk the governance pipeline to decide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {projects.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              disabled={disabled}
              className={`text-left rounded-lg border p-4 transition-all flex flex-col gap-2.5 ${
                isSelected
                  ? "bg-accent/10 border-cyan-500/60 shadow-cyan-glow"
                  : "bg-cyber-base/80 border-cyber-border hover:border-cyber-border"
              } ${disabled ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-cyber-heading leading-snug">{p.title}</h3>
                <span className={`shrink-0 text-[0.625rem] font-mono px-2 py-0.5 rounded border ${CRIT_STYLE[p.criticality] ?? ""}`}>
                  {p.criticality}
                </span>
              </div>
              <p className="text-[0.75rem] text-cyber-muted leading-snug">{p.description}</p>
              <div className="flex items-center gap-1.5 text-[0.6875rem] text-cyber-muted font-mono">
                <Boxes className="w-3.5 h-3.5" />
                {p.model_type}
              </div>
              <div className="flex items-center gap-1.5 text-[0.6875rem] text-cyber-muted">
                <Users className="w-3.5 h-3.5" />
                {p.users}
              </div>
              <div className="mt-auto pt-1">
                <span className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">
                  {p.data_types.length} data type(s) - {p.threats.length} risks to assess
                </span>
              </div>
              {isSelected && (
                <div className="flex items-center gap-1.5 text-[0.6875rem] font-bold text-accent">
                  <ShieldAlert className="w-3.5 h-3.5" /> Selected for governance review
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
