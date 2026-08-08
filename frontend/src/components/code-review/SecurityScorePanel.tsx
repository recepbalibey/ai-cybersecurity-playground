"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import type { RiskLevel } from "@/data/securityCode";

const RISK_COLOR: Record<string, string> = {
  Critical: "text-red-300 border-red-500/50 bg-red-950/30",
  High: "text-orange-300 border-orange-500/50 bg-orange-950/30",
  Medium: "text-yellow-300 border-yellow-500/50 bg-yellow-950/30",
  Low: "text-sky-300 border-sky-500/50 bg-sky-950/30",
  Informational: "text-slate-300 border-slate-600 bg-slate-800/30",
};

const BAR_COLOR: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-sky-500",
  Informational: "bg-slate-500",
};

export function SecurityScorePanel({ before, after, confidence, risk }: {
  before: number; after: number; confidence: number; risk: RiskLevel;
}) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Security Score</h3>
        </div>
        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${RISK_COLOR[risk]}`}>{risk}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-mono font-bold text-cyber-heading leading-none">{before}</div>
          <div className="text-[10px] font-mono text-cyber-muted mt-1">before fix / 100</div>
        </div>
        <div className="text-slate-500 font-mono text-xl">→</div>
        <div>
          <div className="text-3xl font-mono font-bold text-emerald-300 leading-none text-right">{after}</div>
          <div className="text-[10px] font-mono text-cyber-muted mt-1 text-right">after fix / 100</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <ScoreBar label="Before" value={before} color={BAR_COLOR[risk]} />
        <ScoreBar label="After" value={after} color="bg-emerald-500" />
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-cyber-border pt-2">
        <span className="text-[11px] font-mono text-cyber-muted">AI confidence</span>
        <span className="text-[11px] font-mono text-cyan-300">{confidence}%</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-cyber-muted w-12">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}