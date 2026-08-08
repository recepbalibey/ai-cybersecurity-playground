"use client";

import React from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Target, Layers } from "lucide-react";
import type { AssessedThreat } from "@/services/governanceEngine";
import { GOVERNANCE_CONTROLS, THREAT_CATEGORY_BY_ID } from "@/knowledge/governance/knowledgeBase";
import { THREAT_CATEGORIES } from "@/knowledge/governance/knowledgeBase";

interface ThreatWorkspaceProps {
  threats: AssessedThreat[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const LEVEL_COLOR: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-300 border-red-500/40",
  High: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Medium: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Informational: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

export function ThreatWorkspace({
  threats,
  selectedId,
  onSelect,
}: ThreatWorkspaceProps) {
  const selected = threats.find((t) => t.id === selectedId) ?? threats[0];
  const selectedCat = THREAT_CATEGORY_BY_ID[selected?.category];

  const mitigating = selected
    ? GOVERNANCE_CONTROLS.filter((c) => c.mitigates.includes(selected.category))
    : [];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[13px] text-cyan-100/90 flex items-start gap-2.5">
        <Target className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p>
          For each risk, ask the same question: <span className="font-mono text-cyan-300">what could go wrong, why does it
          exist, and what does it cost the business?</span> The arrow shows the residual risk once controls are applied.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Threat list */}
        <div className="lg:col-span-5 h-full">
          <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-cyber-border bg-cyber-surface/60 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
                Identified Risks
              </h3>
              <span className="ml-auto text-[10px] font-mono text-slate-500">{threats.length}</span>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-cyber-border">
              {threats.map((t) => {
                const isSel = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className={`w-full text-left px-4 py-3 transition-all ${
                      isSel ? "bg-cyan-950/30 border-l-2 border-l-cyan-400" : "hover:bg-cyber-surface-hover/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-cyber-heading leading-snug">{t.name}</span>
                      <span className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${LEVEL_COLOR[t.base_level] ?? ""}`}>
                        {t.base_level}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      L{t.likelihood}xI{t.impact}
                      <ArrowRight className="w-3 h-3 text-cyan-500" />
                      L{t.residual_likelihood}xI{t.residual_impact}
                      <span className="ml-auto">{t.category_name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Threat detail - the learning flow */}
        <div className="lg:col-span-7 h-full">
          {selected && (
            <div className="cyber-panel border border-cyber-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-cyber-heading">{selected.name}</h3>
                  <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                    {selected.category_name} - {selectedCat?.stride ?? ""}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <div className={`text-[10px] font-mono rounded border px-1.5 py-0.5 ${LEVEL_COLOR[selected.base_level] ?? ""}`}>
                      {selected.base_level}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{selected.base_weight}/100</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  <div className="text-center">
                    <div className={`text-[10px] font-mono rounded border px-1.5 py-0.5 ${LEVEL_COLOR[selected.residual_level] ?? ""}`}>
                      {selected.residual_level}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{selected.residual_weight}/100</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Why this risk exists</div>
                <p className="text-[12px] text-slate-300 leading-snug">{selected.description}</p>
                {selectedCat && (
                  <p className="text-[11px] text-cyber-muted leading-snug mt-1">{selectedCat.definition}</p>
                )}
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Business impact</div>
                <p className="text-[12px] text-slate-300 leading-snug">{selected.business_consequences}</p>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                  Controls that reduce this risk ({mitigating.length})
                </div>
                {mitigating.length === 0 ? (
                  <p className="text-[11px] text-cyber-muted">No control in the catalog targets this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {mitigating.map((c) => {
                      const applied = selected.controls_applied.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          className={`rounded-md border p-2 text-[11px] leading-snug ${
                            applied
                              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-200"
                              : "border-slate-700 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-semibold">
                            <ShieldCheck className="w-3 h-3" /> {c.name}
                          </div>
                          <div className="mt-0.5">
                            {c.likelihood_reduction > 0 && <>-{c.likelihood_reduction} likelihood</>}
                            {c.likelihood_reduction > 0 && c.impact_reduction > 0 && ", "}
                            {c.impact_reduction > 0 && <>-{c.impact_reduction} impact</>}
                            {c.likelihood_reduction === 0 && c.impact_reduction === 0 && "no direct reduction"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category catalog reference */}
      <details className="cyber-panel border border-cyber-border rounded-lg p-3">
        <summary className="cursor-pointer flex items-center gap-2 text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
          <Layers className="w-4 h-4 text-cyan-400" /> Threat categories ({THREAT_CATEGORIES.length})
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mt-2">
          {THREAT_CATEGORIES.map((c) => (
            <div key={c.id} className="rounded-md border border-cyber-border bg-slate-900/40 p-2">
              <div className="text-[11px] font-semibold text-cyber-heading">{c.name}</div>
              <div className="text-[10px] font-mono text-cyan-300/80">{c.stride}</div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
