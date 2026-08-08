"use client";

import React from "react";
import { ShieldCheck, ShieldX, Gavel, Scale } from "lucide-react";
import { SecurityControl, MissionResult, PolicyDecision } from "@/services/agentSecurity";

interface PolicyEnginePanelProps {
  controls: SecurityControl[];
  activeControls: Set<string>;
  onToggle: (key: string) => void;
  result: MissionResult | null;
}

export function PolicyEnginePanel({ controls, activeControls, onToggle, result }: PolicyEnginePanelProps) {
  const decisions: PolicyDecision[] = result?.policy_log ?? [];

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <Scale className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Policy Engine & Controls
        </h3>
      </div>

      {/* Controls toggles */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {controls.map((c) => {
          const on = activeControls.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => onToggle(c.key)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-md border text-[10px] font-semibold transition-all ${
                on
                  ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              <span className="truncate">{c.name}</span>
              <span
                className={`ml-1.5 inline-block w-6 h-3.5 rounded-full relative shrink-0 ${
                  on ? "bg-emerald-500/70" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${
                    on ? "left-3" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Policy decision log */}
      <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider mb-1.5">
        Policy Decision Log
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {decisions.length === 0 && (
          <p className="text-[11px] font-mono text-cyber-muted py-4 text-center">
            Policy engine idle. Run a mission to log allow/block decisions.
          </p>
        )}
        {decisions.map((d, i) => {
          const allow = d.kind === "policy_allow";
          return (
            <div
              key={i}
              className={`flex items-start gap-2 px-2.5 py-1.5 rounded-md border ${
                allow
                  ? "bg-emerald-950/10 border-emerald-500/20"
                  : "bg-rose-950/20 border-rose-500/30"
              }`}
            >
              {allow ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldX className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className={`text-[10px] font-mono ${allow ? "text-emerald-300" : "text-rose-300"}`}>
                  {d.detail}
                </div>
                {d.reason && (
                  <div className="text-[10px] font-mono text-cyber-muted">
                    reason: {d.reason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-2.5 rounded-md bg-slate-950/60 border border-slate-800">
        <div className="flex items-center gap-1.5 mb-1">
          <Gavel className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Decision flow</span>
        </div>
        <p className="text-[10px] font-mono text-cyber-muted leading-relaxed">
          Requested Action → Policy Check → Permission Check → Risk Evaluation → Allow / Block
        </p>
      </div>
    </div>
  );
}