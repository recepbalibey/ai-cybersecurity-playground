"use client";

import React, { useState } from "react";
import { BookOpen, Swords, ShieldCheck } from "lucide-react";
import {
  VisionConcept,
  AttackMethod,
  DefenseMechanism,
  VisionAnalysisResult,
} from "@/services/visionSecurity";

interface KnowledgePaneProps {
  concepts: VisionConcept[];
  attacks: AttackMethod[];
  defenses: DefenseMechanism[];
  result: VisionAnalysisResult | null;
}

type Tab = "points" | "attacks" | "concepts";

export function KnowledgePane({ concepts, attacks, defenses, result }: KnowledgePaneProps) {
  const [tab, setTab] = useState<Tab>("points");

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "points", label: "Teaching Points", icon: BookOpen },
    { id: "attacks", label: "Attacks & Defenses", icon: Swords },
    { id: "concepts", label: "ML Security Concepts", icon: ShieldCheck },
  ];

  return (
    <div className="cyber-panel border border-cyber-border p-5 rounded-lg h-full flex flex-col">
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all ${
                tab === t.id
                  ? "bg-cyan-950/40 border border-cyan-500/50 text-cyan-300"
                  : "bg-slate-950/60 border border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 overflow-y-auto flex-1">
        {tab === "points" && (
          <>
            {(result?.teaching_points ?? []).length === 0 && (
              <p className="text-xs font-mono text-cyber-muted">
                Run an experiment to unlock its teaching points.
              </p>
            )}
            {(result?.teaching_points ?? []).map((p, i) => (
              <div key={i} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                    {p.concept}
                  </span>
                  <span className="text-[10px] font-mono text-cyber-muted">#{i + 1}</span>
                </div>
                <div className="text-xs font-bold text-cyber-heading mb-1">{p.title}</div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">{p.explanation}</p>
                <p className="text-[11px] text-cyan-300/90 mt-2 font-mono">→ {p.key_takeaway}</p>
              </div>
            ))}
          </>
        )}

        {tab === "attacks" && (
          <>
            <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider mb-1">Attack classes</div>
            {attacks.map((a) => (
              <div key={a.key} className="p-3 bg-slate-950/60 border border-slate-800 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">{a.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    a.severity === "Critical" ? "border-rose-500 text-rose-400" : a.severity === "High" ? "border-orange-500 text-orange-400" : "border-amber-500 text-amber-400"
                  }`}>
                    {a.severity}
                  </span>
                </div>
                <p className="text-[11px] text-cyber-muted mt-1.5">{a.description}</p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400/80">Mitigation: {a.mitigations}</div>
              </div>
            ))}
            <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider mt-4 mb-1">Defense mechanisms</div>
            {defenses.map((d) => (
              <div key={d.key} className="p-3 bg-slate-950/60 border border-slate-800 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">{d.name}</span>
                  <span className="text-[9px] font-mono text-emerald-400/80">{d.effectiveness}</span>
                </div>
                <p className="text-[11px] text-cyber-muted mt-1.5">{d.description}</p>
                <div className="mt-2 text-[10px] font-mono text-amber-400/80">Trade-off: {d.tradeoff}</div>
              </div>
            ))}
          </>
        )}

        {tab === "concepts" &&
          concepts.map((c) => (
            <div key={c.key} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-md">
              <div className="text-xs font-bold text-cyber-heading mb-1">{c.name}</div>
              <div className="text-[11px] text-cyan-300/90 font-mono mb-1.5">{c.summary}</div>
              <p className="text-[11px] text-cyber-muted leading-relaxed">{c.details}</p>
              <p className="text-[11px] text-emerald-300/80 mt-2 font-mono">✓ {c.good_practice}</p>
            </div>
          ))}
      </div>
    </div>
  );
}