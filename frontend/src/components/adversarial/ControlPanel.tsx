"use client";

import React from "react";
import { Zap, Activity, ShieldCheck, Crosshair, Trophy } from "lucide-react";
import { VisionExperiment, VisionAnalysisResult } from "@/services/visionSecurity";

interface ControlPanelProps {
  experiment: VisionExperiment | undefined;
  mode: "clean" | "adversarial";
  onModeChange: (m: "clean" | "adversarial") => void;
  onRun: () => void;
  isProcessing: boolean;
  result: VisionAnalysisResult | null;
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-2.5 rounded-md bg-slate-950/60 border border-slate-800">
      <span className={`text-lg font-bold font-mono ${accent ?? "text-cyber-heading"}`}>{value}</span>
      <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

export function ControlPanel({
  experiment,
  mode,
  onModeChange,
  onRun,
  isProcessing,
  result,
}: ControlPanelProps) {
  const totalShift = result && !result.is_defense_comparison ? result.confidence_gap : 0;
  const blockedCount = result && (result.outcome === "blocked" || result.outcome === "defended") ? 1 : 0;

  return (
    <div className="cyber-panel border border-cyber-border p-5 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Run Analysis
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyber-muted">{experiment?.attack_type ?? "—"}</span>
      </div>

      {/* mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onModeChange("clean")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] font-semibold transition-all ${
            mode === "clean"
              ? "bg-slate-800/80 border-cyan-500/50 text-cyan-300"
              : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Clean Input
        </button>
        <button
          onClick={() => onModeChange("adversarial")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] font-semibold transition-all ${
            mode === "adversarial"
              ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
              : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" /> Adversarial Input
        </button>
      </div>

      {/* run button */}
      <button
        onClick={onRun}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-cyan-glow"
      >
        {isProcessing ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
            Running…
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" /> Run Experiment
          </>
        )}
      </button>

      {/* scoreboard */}
      <div className="border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">
            Attack Tally
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Robustness" value={experiment?.robustness ?? 0} accent="text-cyan-400" />
          <Stat label="Conf Shift" value={`-${totalShift}%`} accent="text-rose-400" />
          <Stat label="Defenses Held" value={blockedCount} accent="text-emerald-400" />
        </div>
      </div>

      {experiment && (
        <p className="text-[10px] font-mono text-cyber-muted leading-relaxed">
          {experiment.description}
        </p>
      )}
    </div>
  );
}