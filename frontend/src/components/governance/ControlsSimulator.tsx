"use client";

import React from "react";
import { ShieldCheck, ShieldOff, Layers, Lock } from "lucide-react";
import type { ControlResult } from "@/services/governanceEngine";

interface ControlsSimulatorProps {
  controls: ControlResult[];
  onToggle: (id: string) => void;
  residualScore: number;
  residualLevel: string;
  baseScore: number;
}

export function ControlsSimulator({
  controls,
  onToggle,
  residualScore,
  residualLevel,
  baseScore,
}: ControlsSimulatorProps) {
  const enabled = controls.filter((c) => c.enabled).length;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[0.8125rem] text-cyber-text flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <p>
          Controls are the levers of governance. Each one reduces the <span className="font-mono text-accent">likelihood</span> or{" "}
          <span className="font-mono text-accent">impact</span> of specific threat categories - and each has a trade-off.
          Baseline controls are already in force.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Control catalog */}
        <div className="lg:col-span-7 h-full">
          <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-cyber-border bg-cyber-surface/60 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-cyber-heading">
                Security Control Catalog
              </h3>
              <span className="ml-auto text-[0.625rem] font-mono text-cyber-muted">
                {enabled}/{controls.length} active
              </span>
            </div>
            <div className="max-h-[560px] overflow-y-auto divide-y divide-cyber-border">
              {controls.map((c) => (
                <div key={c.id} className="px-4 py-3 flex items-start gap-3">
                  <button
                    onClick={() => onToggle(c.id)}
                    disabled={c.baseline}
                    aria-pressed={c.enabled}
                    className={`relative shrink-0 inline-flex h-5 w-9 mt-0.5 cursor-pointer rounded-full border transition-colors ${
                      c.enabled ? "bg-emerald-500/70" : "bg-cyber-surface-hover"
                    } ${c.baseline ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        c.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[0.75rem] font-bold ${c.enabled ? "text-status-success" : "text-cyber-heading"}`}>
                        {c.name}
                      </span>
                      {c.baseline && (
                        <span className="text-[0.625rem] font-mono px-1.5 py-0.5 rounded border border-cyber-border text-cyber-muted uppercase tracking-wider">
                          Baseline
                        </span>
                      )}
                    </div>
                    <p className="text-[0.6875rem] text-cyber-muted leading-snug mt-0.5">{c.description}</p>
                    <div className="mt-1.5 flex items-start gap-1.5 text-[0.625rem] font-mono text-cyber-muted">
                      <Layers className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="leading-snug">{c.mitigates.join(", ")}</span>
                    </div>
                    <div className="mt-1 text-[0.6875rem] text-status-warning leading-snug">
                      Trade-off: {c.trade_offs}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live residual risk readout */}
        <div className="lg:col-span-5 h-full">
          <div className="cyber-panel border border-cyber-border rounded-lg p-4 h-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ShieldOff className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-cyber-heading">
                Residual Risk
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[0.6875rem] font-mono mb-1">
                  <span className="text-cyber-muted">Base risk</span>
                  <span className="text-cyber-text">{baseScore}/100</span>
                </div>
                <div className="h-2 rounded bg-cyber-surface-hover overflow-hidden">
                  <div className="h-full bg-red-500/80" style={{ width: `${baseScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[0.6875rem] font-mono mb-1">
                  <span className="text-cyber-muted">Residual risk</span>
                  <span className="text-status-success">{residualScore}/100</span>
                </div>
                <div className="h-2 rounded bg-cyber-surface-hover overflow-hidden">
                  <div className="h-full bg-emerald-500/80 transition-all duration-300" style={{ width: `${residualScore}%` }} />
                </div>
              </div>
              <div className="text-[0.6875rem] text-cyber-muted">
                Base - Residual = <span className="text-accent font-mono">{baseScore - residualScore} pts</span> of risk
                managed by the selected controls.
              </div>
            </div>

            <div className="rounded-md border border-cyber-border bg-cyber-base/40 p-3 text-[0.6875rem] text-cyber-muted leading-snug">
              Turn controls on and off and watch the residual bar move. The goal is a risk level the organization is
              willing to accept - not necessarily zero.
            </div>

            <div className="mt-auto rounded-md border border-cyan-500/30 bg-cyan-500/5 p-3 text-[0.75rem] text-cyber-text leading-snug">
              Current residual level: <span className="font-mono text-accent font-bold">{residualLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
