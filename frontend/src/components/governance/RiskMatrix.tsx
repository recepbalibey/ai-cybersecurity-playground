"use client";

import React from "react";
import { BarChart3, CircleDot, CircleDashed } from "lucide-react";
import type { AssessedThreat, RiskLevel } from "@/services/governanceEngine";

interface RiskMatrixProps {
  threats: AssessedThreat[];
  baseScore: number;
  residualScore: number;
  baseLevel: RiskLevel;
  residualLevel: RiskLevel;
}

function cellWeight(likelihood: number, impact: number): number {
  const v = 10 + ((likelihood * impact - 1) * 90) / 24 + 0.5;
  return Math.max(0, Math.min(100, Math.floor(v)));
}

function cellLevel(w: number): RiskLevel {
  if (w >= 85) return "Critical";
  if (w >= 65) return "High";
  if (w >= 45) return "Medium";
  if (w >= 25) return "Low";
  return "Informational";
}

function cellClass(w: number): string {
  const lvl = cellLevel(w);
  return `gov-cell gov-cell-${lvl.toLowerCase()}`;
}

export function RiskMatrix({
  threats,
  baseScore,
  residualScore,
  baseLevel,
  residualLevel,
}: RiskMatrixProps) {
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Heat map - dominant */}
      <div className="lg:col-span-8 h-full">
        <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden h-full">
          <div className="px-4 py-3 border-b border-cyber-border bg-cyber-surface/60 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Risk Heat Map - Before vs After Controls
            </h3>
            <span className="ml-auto text-[10px] font-mono text-slate-500">LIKELIHOOD x IMPACT</span>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[420px]">
                {/* header row */}
                <div className="flex">
                  <div className="w-14 shrink-0 flex items-center justify-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    L\\I
                  </div>
                  {impacts.map((i) => (
                    <div key={i} className="flex-1 text-center text-[10px] font-mono text-slate-500">
                      {i}
                    </div>
                  ))}
                </div>
                {/* rows */}
                {likelihoods.map((l) => (
                  <div key={l} className="flex items-center mt-1.5">
                    <div className="w-14 shrink-0 text-center text-[10px] font-mono text-slate-500">{l}</div>
                    {impacts.map((i) => {
                      const w = cellWeight(l, i);
                      const before = threats.filter((t) => t.likelihood === l && t.impact === i);
                      const after = threats.filter((t) => t.residual_likelihood === l && t.residual_impact === i);
                      return (
                        <div key={i} className={`flex-1 h-10 rounded flex items-center justify-center mx-0.5 ${cellClass(w)}`}>
                          {before.map((b) => (
                            <span key={`b${b.id}`} title={`Before: ${b.name}`}>
                              <CircleDot className="w-3.5 h-3.5 text-white drop-shadow" />
                            </span>
                          ))}
                          {after.map((a) => (
                            <span key={`a${a.id}`} title={`After: ${a.name}`}>
                              <CircleDashed className="w-3.5 h-3.5 text-white drop-shadow" />
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* legend */}
                <div className="flex items-center gap-3 mt-4 text-[10px] font-mono text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><span className="gov-dot gov-dot-critical" /> Critical 85-100</span>
                  <span className="flex items-center gap-1"><span className="gov-dot gov-dot-high" /> High 65-84</span>
                  <span className="flex items-center gap-1"><span className="gov-dot gov-dot-medium" /> Medium 45-64</span>
                  <span className="flex items-center gap-1"><span className="gov-dot gov-dot-low" /> Low 25-44</span>
                  <span className="flex items-center gap-1"><span className="gov-dot gov-dot-info" /> Informational</span>
                  <span className="flex items-center gap-1 ml-auto">
                    <CircleDot className="w-3 h-3 text-slate-300" /> before
                    <CircleDashed className="w-3 h-3 text-slate-300 ml-2" /> after
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate scores */}
      <div className="lg:col-span-4 h-full">
        <div className="cyber-panel border border-cyber-border rounded-lg p-4 h-full flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Aggregate Risk
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-red-500/40 bg-red-950/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-red-300">Base</div>
              <div className="text-2xl font-bold text-red-200 font-mono">{baseScore}</div>
              <div className="text-[10px] font-mono text-red-300/80">{baseLevel}</div>
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-950/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">Residual</div>
              <div className="text-2xl font-bold text-emerald-200 font-mono">{residualScore}</div>
              <div className="text-[10px] font-mono text-emerald-300/80">{residualLevel}</div>
            </div>
          </div>
          <div className="text-[11px] text-cyber-muted leading-snug">
            The aggregate is weighted toward the worst threat, because one critical risk should
            block a go-live even when the average looks fine.
          </div>
          <div className="rounded-md border border-cyber-border bg-slate-900/40 p-3 text-[11px] text-cyber-muted leading-snug">
            Each dot is one identified risk. Follow it from its base position to where the controls
            move it on the grid.
          </div>
        </div>
      </div>
    </div>
  );
}
