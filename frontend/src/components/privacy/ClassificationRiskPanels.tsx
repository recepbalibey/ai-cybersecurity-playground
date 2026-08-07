"use client";

import React from "react";
import { Tags, ShieldAlert } from "lucide-react";
import type { ClassificationResult, RiskResult } from "@/services/privacyScanner";

const CLASS_COLOR: Record<string, string> = {
  Public: "text-slate-300 border-slate-600 bg-slate-800/40",
  Internal: "text-sky-300 border-sky-500/50 bg-sky-950/30",
  Confidential: "text-amber-300 border-amber-500/50 bg-amber-950/30",
  Restricted: "text-orange-300 border-orange-500/50 bg-orange-950/30",
  "Highly Restricted": "text-red-300 border-red-500/50 bg-red-950/30",
};

const RISK_COLOR: Record<string, string> = {
  Critical: "text-red-300 border-red-500/60 bg-red-950/30",
  High: "text-orange-300 border-orange-500/50 bg-orange-950/30",
  Medium: "text-yellow-300 border-yellow-500/50 bg-yellow-950/30",
  Low: "text-sky-300 border-sky-500/50 bg-sky-950/30",
  Informational: "text-slate-300 border-slate-600 bg-slate-800/30",
};

export function ClassificationPanel({ classification }: { classification: ClassificationResult }) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Tags className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Data Classification</h3>
      </div>
      <div className={`px-3 py-2 rounded-md border text-sm font-mono font-bold w-fit ${CLASS_COLOR[classification.label] ?? CLASS_COLOR.Internal}`}>
        {classification.label}
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Business impact</div>
        <p className="text-[12px] text-cyber-muted">{classification.impact}</p>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Recommended handling</div>
        <p className="text-[12px] text-cyber-muted">{classification.handling}</p>
      </div>
      <div className="mt-1 border-t border-cyber-border pt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Based on</div>
        <p className="text-[11px] font-mono text-cyan-300/80 leading-snug">{classification.basis}</p>
      </div>
    </div>
  );
}

export function PrivacyRiskPanel({ risk }: { risk: RiskResult }) {
  const pct = Math.min(100, Math.max(0, risk.score));
  const color = RISK_COLOR[risk.level];
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-orange-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">AI Privacy Risk</h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-4xl font-mono font-bold text-cyber-heading leading-none">{risk.score}</div>
        <div className="text-[11px] font-mono text-cyber-muted">/ 100</div>
        <span className={`ml-auto px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${color}`}>{risk.level}</span>
      </div>

      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            risk.level === "Critical" ? "bg-red-500" : risk.level === "High" ? "bg-orange-500" : risk.level === "Medium" ? "bg-yellow-500" : "bg-sky-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 text-[12px]">
        <Fact label="Business impact" value={risk.business_impact} />
        <Fact label="Compliance impact" value={risk.compliance_impact} />
        <Fact label="Likelihood" value={risk.likelihood} />
      </div>

      <div className="rounded-md border border-emerald-800/40 bg-emerald-950/20 px-3 py-2 text-[12px] text-emerald-100/90">
        {risk.overall}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</div>
      <p className="text-cyber-muted leading-snug">{value}</p>
    </div>
  );
}
