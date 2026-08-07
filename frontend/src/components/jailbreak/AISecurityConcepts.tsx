"use client";

import React from "react";
import { BookOpen, Lightbulb, ShieldCheck } from "lucide-react";
import { SafetyConcept } from "@/services/jailbreakEvaluator";

interface AISecurityConceptsProps {
  concepts: SafetyConcept[];
}

export function AISecurityConcepts({ concepts }: AISecurityConceptsProps) {
  const [active, setActive] = React.useState(concepts[0]?.key ?? "");

  React.useEffect(() => {
    if (concepts.length > 0 && !concepts.some((c) => c.key === active)) {
      setActive(concepts[0].key);
    }
  }, [concepts, active]);

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            AI Security Concepts
          </h2>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1.5">
          {concepts.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`px-2 py-2 rounded-md border text-[11px] font-semibold transition-all ${
                active === c.key
                  ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300"
                  : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {concepts.map((c) =>
          active === c.key ? (
            <div key={c.key} className="p-4 rounded-lg border border-slate-800 bg-slate-950/70 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-cyber-heading">{c.name}</span>
              </div>
              <p className="text-xs font-semibold text-cyan-200 leading-relaxed">{c.summary}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{c.details}</p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-200 leading-relaxed">{c.good_practice}</p>
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}