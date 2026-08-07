"use client";

import React from "react";
import { FlaskConical, Crosshair, Eye, Sparkles, ShieldCheck } from "lucide-react";
import { VisionExperiment, Difficulty } from "@/services/visionSecurity";

interface ExperimentLibraryProps {
  experiments: VisionExperiment[];
  selectedKey: string;
  onSelect: (key: string) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}

const ATTACK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  noise: Crosshair,
  occlusion: Eye,
  transformation: Sparkles,
};

export function ExperimentLibrary({
  experiments,
  selectedKey,
  onSelect,
  difficulty,
  onDifficultyChange,
}: ExperimentLibraryProps) {
  const filtered = experiments.filter((e) => e.difficulty === difficulty);

  return (
    <div className="cyber-panel border border-cyber-border p-5 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <FlaskConical className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Experiment Library
        </h3>
      </div>

      <div className="flex gap-2 mb-4">
        {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            className={`px-3 py-2 rounded-md border text-[11px] font-semibold flex-1 transition-all ${
              difficulty === d
                ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
            }`}
          >
            {d[0].toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1">
        {filtered.map((e) => {
          const active = e.key === selectedKey;
          const Icon = ATTACK_ICONS[e.attack_type] ?? Crosshair;
          const isDefense = e.key.startsWith("4_");
          return (
            <button
              key={e.key}
              onClick={() => onSelect(e.key)}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                active
                  ? "bg-cyan-950/40 border-cyan-500/50 shadow-cyan-glow"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${isDefense ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-cyan-400 border border-slate-700"}`}>
                  {isDefense ? <ShieldCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-cyber-heading">{e.title}</span>
                    <span className="text-[10px] font-mono text-cyber-muted uppercase">{e.attack_type}</span>
                  </div>
                  <p className="text-[11px] text-cyber-muted mt-1 leading-relaxed line-clamp-2">
                    {e.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-slate-400">Robustness</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${e.robustness >= 70 ? "bg-emerald-500" : e.robustness >= 45 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${e.robustness}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyber-heading">{e.robustness}%</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-md bg-slate-950/70 border border-slate-800">
        <p className="text-[10px] font-mono text-cyber-muted leading-relaxed">
          CLASSROOM SANDBOX — Synthetic images, simulated models, fictional
          subjects (Alpha / Beta / Gamma). No real identity data.
        </p>
      </div>
    </div>
  );
}
