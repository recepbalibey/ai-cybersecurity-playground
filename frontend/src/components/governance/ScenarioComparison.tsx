"use client";

import React from "react";
import { GitCompare, TrendingDown } from "lucide-react";
import type { GovernanceComparison } from "@/services/governanceEngine";

interface ScenarioComparisonProps {
  comparison: GovernanceComparison;
}

export function ScenarioComparison({ comparison }: ScenarioComparisonProps) {
  const { poor, well } = comparison;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 h-full">
        <div className="cyber-panel border border-cyber-border rounded-lg p-4 h-full">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-cyber-heading">
              Poorly vs Well Governed
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[0.6875rem] font-mono mb-1">
                <span className="text-status-danger">{poor.label}</span>
                <span className="text-cyber-text">{poor.score}/100</span>
              </div>
              <div className="h-2.5 rounded bg-cyber-surface-hover overflow-hidden">
                <div className="h-full bg-red-500/80" style={{ width: `${poor.score}%` }} />
              </div>
              <div className="mt-1 text-[0.625rem] font-mono text-cyber-muted">
                {poor.controls} controls - recommendation: {poor.recommendation}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[0.6875rem] font-mono mb-1">
                <span className="text-status-success">{well.label}</span>
                <span className="text-cyber-text">{well.score}/100</span>
              </div>
              <div className="h-2.5 rounded bg-cyber-surface-hover overflow-hidden">
                <div className="h-full bg-emerald-500/80" style={{ width: `${well.score}%` }} />
              </div>
              <div className="mt-1 text-[0.625rem] font-mono text-cyber-muted">
                {well.controls} controls - recommendation: {well.recommendation}
              </div>
            </div>

            <div className="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-3 flex items-center gap-2 text-[0.75rem] text-cyber-text">
              <TrendingDown className="w-4 h-4 text-accent shrink-0" />
              <span>
                Governance discipline moves the outcome by <span className="font-mono text-accent font-bold">{comparison.difference} points</span>.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 h-full">
        <div className="cyber-panel border border-cyber-border rounded-lg p-4 h-full">
          <h3 className="text-xs font-bold text-cyber-heading mb-2">
            What changed
          </h3>
          <p className="text-[0.75rem] text-cyber-muted leading-snug">{comparison.notes}</p>
        </div>
      </div>
    </div>
  );
}
