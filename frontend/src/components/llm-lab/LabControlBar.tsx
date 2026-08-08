"use client";

import React from "react";
import { FlaskConical, ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import { LabMode, Difficulty } from "@/services/llmSecuritySimulator";

interface LabControlBarProps {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  scenarioKey: string;
  onScenarioChange: (key: string) => void;
  scenarios: { key: string; title: string; difficulty: Difficulty }[];
  securityScore: number | null;
  isProcessing: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function LabControlBar({
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  scenarioKey,
  onScenarioChange,
  scenarios,
  securityScore,
  isProcessing,
}: LabControlBarProps) {
  const filtered = scenarios.filter(
    (s) => s.difficulty === difficulty
  );

  return (
    <div className="cyber-panel border border-cyber-border p-5 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
            LLM Security Laboratory
          </h2>
        </div>
        <span className="text-xs font-mono text-cyber-muted uppercase">
          Simulated Sandbox Environment
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Mode Selector */}
        <div className="md:col-span-5">
          <div className="text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
            Application Mode
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onModeChange("vulnerable")}
              className={`px-3 py-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === "vulnerable"
                  ? "bg-red-950/40 border-red-500/60 text-red-300 shadow-red-glow"
                  : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Vulnerable App
            </button>
            <button
              onClick={() => onModeChange("protected")}
              className={`rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                mode === "protected"
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-emerald-glow"
                  : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Protected App
            </button>
          </div>
        </div>

        {/* Difficulty + Scenario */}
        <div className="md:col-span-4">
          <div className="text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
            Attack Difficulty
          </div>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => onDifficultyChange(d.value)}
                className={`px-3 py-3 rounded-lg border text-[11px] font-semibold flex-1 transition-all ${
                  difficulty === d.value
                    ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <select
              aria-label="Attack scenario"
              value={scenarioKey}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="w-full h-10 px-3 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-cyber-heading focus:outline-none focus:border-cyan-500 transition-all"
            >
              {filtered.length === 0 &&
                scenarios.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title}
                  </option>
                ))}
              {filtered.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Security Score */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
            LLM Application Security
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    securityScore !== null && securityScore >= 70
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${securityScore ?? 0}%` }}
                ></div>
              </div>
            </div>
            <span
              className={`text-xl font-bold font-mono ${
                securityScore !== null && securityScore >= 70
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {securityScore ?? "--"}%
            </span>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mt-2">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Simulating model behavior...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}