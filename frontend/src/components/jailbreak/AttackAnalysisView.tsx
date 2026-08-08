"use client";

import React from "react";
import {
  Crosshair,
  Target,
  BookOpenCheck,
  ShieldAlert,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { EvaluationResult } from "@/services/jailbreakEvaluator";

interface AttackAnalysisViewProps {
  result: EvaluationResult | null;
}

export function AttackAnalysisView({ result }: AttackAnalysisViewProps) {
  if (!result) {
    return (
      <div className="cyber-panel border border-cyber-border overflow-hidden">
        <div className="p-4 border-b border-cyber-border bg-cyber-surface/60">
          <div className="flex items-center gap-2.5">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
              Attack Analysis
            </h2>
          </div>
        </div>
        <div className="p-6 text-center text-sm text-slate-500">
          Run an evaluation to see how this attack was analyzed and why it worked or failed.
        </div>
      </div>
    );
  }

  const aa = result.attack_analysis;
  const blocked = result.status === "BLOCKED";
  const compromised = result.status === "COMPROMISED";

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden">
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Attack Analysis
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
            blocked
              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
              : compromised
              ? "bg-red-950/60 text-red-400 border border-red-500/40"
              : "bg-slate-900 text-slate-400 border border-slate-700"
          }`}
        >
          {result.status}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Header info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field icon={<Target className="w-3.5 h-3.5" />} label="Technique" value={aa.technique} />
          <Field icon={<Crosshair className="w-3.5 h-3.5" />} label="Category" value={aa.category} />
          <Field icon={<ArrowRight className="w-3.5 h-3.5" />} label="Difficulty" value={aa.difficulty} />
        </div>

        {/* Goal */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 mb-1.5">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Goal of the Attacker
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{aa.goal}</p>
        </div>

        {/* Why worked/failed */}
<div
          className={`p-4 rounded-lg border ${
            compromised
              ? "bg-red-950/20 border-red-500/40"
              : "bg-emerald-950/10 border-emerald-500/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={compromised ? "text-red-400" : "text-emerald-400"}>
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-cyber-heading">
              Why it {compromised ? "worked" : "failed"}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{aa.why_worked_or_failed}</p>
        </div>

        {/* Security lesson */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpenCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Security Lesson
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{result.lesson.headline}</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{result.lesson.safety_lesson}</p>
        </div>

        {/* Possible defenses */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Possible Defenses
            </span>
          </div>
          <ul className="space-y-1.5">
            {aa.defenses.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-1.5 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xs font-semibold text-cyber-heading break-words">{value}</div>
    </div>
  );
}