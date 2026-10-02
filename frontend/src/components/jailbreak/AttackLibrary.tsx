"use client";

import React from "react";
import {
  FlaskConical,
  Target,
  Swords,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  JailbreakScenario,
  AttackCategory,
  CategoryKey,
  Difficulty,
} from "@/services/jailbreakEvaluator";

interface AttackLibraryProps {
  scenarios: JailbreakScenario[];
  categories: AttackCategory[];
  selectedScenarioKey: string;
  onSelectScenario: (key: string) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; icon: React.ElementType }[] = [
  { value: "beginner", label: "Beginner", icon: Target },
  { value: "intermediate", label: "Intermediate", icon: Swords },
  { value: "advanced", label: "Advanced", icon: ShieldAlert },
];

const categoryIcon: Record<CategoryKey, React.ElementType> = {
  role_manipulation: Swords,
  context_switching: FlaskConical,
  instruction_conflict: ShieldAlert,
  encoding: Target,
  multi_turn: Clock,
  social_engineering: CheckCircle2,
};

export function AttackLibrary({
  scenarios,
  categories,
  onSelectScenario,
  selectedScenarioKey: scenarioKey,
  difficulty,
  onDifficultyChange,
}: AttackLibraryProps) {
  const filtered = scenarios.filter((s) => {
    const cat = categories.find((c) => c.key === s.category);
    return (cat?.difficulty ?? s.difficulty) === difficulty;
  });
  const shown = filtered.length > 0 ? filtered : scenarios;

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Attack Library
          </h2>
        </div>
        <span className="text-[0.6875rem] text-cyber-muted font-mono uppercase">
          {scenarios.length} techniques
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Difficulty filter */}
        <div>
          <div className="text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
            Difficulty
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.value}
                  onClick={() => onDifficultyChange(d.value)}
                  className={`px-2 py-2.5 rounded-lg border text-[0.6875rem] font-semibold flex flex-col items-center gap-1 transition-all ${
                    difficulty === d.value
                      ? "bg-accent/10 border-cyan-500/60 text-accent"
                      : "bg-cyber-base/70 border-cyber-border text-cyber-muted hover:border-cyber-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario cards */}
        <div className="space-y-2">
          {shown.map((sc) => {
            const cat = categories.find((c) => c.key === sc.category);
            const Icon = categoryIcon[sc.category] ?? Target;
            const active = scenarioKey === sc.key;
            return (
              <button
                key={sc.key}
                onClick={() => onSelectScenario(sc.key)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                  active
                    ? "bg-accent/10 border-cyan-500/60 shadow-cyan-glow"
                    : "bg-cyber-base/70 border-cyber-border hover:border-cyber-border"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Icon className={`w-4 h-4 ${active ? "text-accent" : "text-cyber-muted"}`} />
                  <span
                    className={`text-sm font-bold font-mono ${
                      active ? "text-cyber-text" : "text-cyber-heading"
                    }`}
                  >
                    {sc.title}
                  </span>
                  <span
                    className={`ml-auto text-[0.625rem] font-mono px-1.5 py-0.5 rounded uppercase ${
                      sc.difficulty === "advanced"
                        ? "bg-status-danger/10 text-status-danger border border-red-500/40"
                        : sc.difficulty === "intermediate"
                        ? "bg-status-warning/10 text-status-warning border border-amber-500/40"
                        : "bg-status-success/10 text-status-success border border-emerald-500/40"
                    }`}
                  >
                    {sc.difficulty}
                  </span>
                </div>
                <p className="text-[0.6875rem] text-cyber-muted leading-relaxed mb-1.5">
                  {cat?.description ?? sc.description}
                </p>
                <p className="text-[0.6875rem] text-accent font-mono">
                  <span className="text-accent">Objective:</span>{" "}
                  {sc.learning_objective}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}