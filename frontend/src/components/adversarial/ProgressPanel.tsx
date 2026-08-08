"use client";

import React from "react";
import { Award, Layers, Activity, ShieldCheck } from "lucide-react";
import { VisionAnalysisResult } from "@/services/visionSecurity";

export type BadgeId =
  | "first-attack"
  | "adversarial-tester"
  | "defense"
  | "ai-red-team-specialist";

interface AchievementDef {
  id: BadgeId;
  name: string;
  desc: string;
  test: (r: VisionAnalysisResult[] | null, experiments: number) => boolean;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-attack",
    name: "ML Security Novice",
    desc: "Run your first adversarial experiment.",
    hint: "Run any experiment once.",
    icon: Layers,
    test: (_r, experiments) => experiments >= 1,
  },
  {
    id: "adversarial-tester",
    name: "Adversarial Tester",
    desc: "Fully compromise a model with an adversarial input.",
    hint: "Run an experiment in adversarial mode that results in a misclassification.",
    icon: Activity,
    test: (r) => !!r && r.some((x) => x.outcome === "misclassified"),
  },
  {
    id: "defense",
    name: "Defense Engineer",
    desc: "Execute the defense comparison experiment.",
    hint: "Run the 4_defense_comparison (advanced) experiment.",
    icon: ShieldCheck,
    test: (r) => !!r && r.some((x) => x.is_defense_comparison),
  },
  {
    id: "ai-red-team-specialist",
    name: "AI Red Team Specialist",
    desc: "Uncover a robustness weakness across the attack classes.",
    hint: "Run an adversarial experiment in noise, occlusion, and transformation.",
    icon: Award,
    test: (r) => {
      if (!r) return false;
      const types = new Set(r.filter((x) => x.outcome === "misclassified").map((x) => x.attack_type));
      return types.has("noise") && types.has("occlusion") && types.has("transformation");
    },
  },
];

interface ProgressPanelProps {
  results: VisionAnalysisResult[];
  experiments: number;
}

export function ProgressPanel({ results, experiments }: ProgressPanelProps) {
  const earned = ACHIEVEMENTS.filter((a) => a.test(results, experiments)).map((a) => a.id);
  const progress = Math.round((earned.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="cyber-panel border border-cyber-border p-5 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <Award className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Achievement Tiers
        </h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Progress</span>
          <span className="text-xs font-mono text-cyber-heading">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-2.5 flex-1">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.icon;
          const has = earned.includes(a.id);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                has
                  ? "bg-amber-950/20 border-amber-500/40"
                  : "bg-slate-950/50 border-slate-800"
              }`}
            >
              <div
                className={`p-2 rounded-md ${has ? "bg-amber-500/20 text-amber-300" : "bg-slate-900 text-slate-500"}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-cyber-heading flex items-center gap-2">
                  {a.name}
                  {has && <span className="text-[10px] font-mono text-amber-300 border border-amber-500/40 rounded px-1">UNLOCKED</span>}
                </div>
                <p className="text-[10px] text-cyber-muted mt-0.5">{a.desc}</p>
                <p className="text-[10px] font-mono text-cyber-muted/60 mt-0.5">Hint: {a.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}