"use client";

import React from "react";
import { Tags, ShieldAlert } from "lucide-react";
import type { ClassificationResult, RiskResult } from "@/services/privacyScanner";

const CLASS_COLOR: Record<string, string> = {
  Public: "text-cyber-text border-cyber-border bg-cyber-surface-hover/40",
  Internal: "text-status-info border-sky-500/50 bg-status-info/10",
  Confidential: "text-status-warning border-amber-500/50 bg-status-warning/10",
  Restricted: "text-status-warning border-orange-500/50 bg-status-warning/10",
  "Highly Restricted": "text-status-danger border-red-500/50 bg-status-danger/10",
};

const RISK_COLOR: Record<string, string> = {
  Critical: "text-status-danger border-red-500/60 bg-status-danger/10",
  High: "text-status-warning border-orange-500/50 bg-status-warning/10",
  Medium: "text-status-warning border-yellow-500/50 bg-status-warning/10",
  Low: "text-status-info border-sky-500/50 bg-status-info/10",
  Informational: "text-cyber-text border-cyber-border bg-cyber-surface-hover/30",
};

export function ClassificationPanel({ classification }: { classification: ClassificationResult }) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Tags className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-cyber-heading">Data Classification</h3>
      </div>
      <div className={`px-3 py-2 rounded-md border text-sm font-mono font-bold w-fit ${CLASS_COLOR[classification.label] ?? CLASS_COLOR.Internal}`}>
        {classification.label}
      </div>
      <div>
        <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Business impact</div>
        <p className="text-[0.75rem] text-cyber-muted">{classification.impact}</p>
      </div>
      <div>
        <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Recommended handling</div>
        <p className="text-[0.75rem] text-cyber-muted">{classification.handling}</p>
      </div>
      <div className="mt-1 border-t border-cyber-border pt-2">
        <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted mb-1">Based on</div>
        <p className="text-[0.6875rem] font-mono text-accent leading-snug">{classification.basis}</p>
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
        <ShieldAlert className="w-4 h-4 text-status-warning" />
        <h3 className="text-xs font-bold text-cyber-heading">AI Privacy Risk</h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-4xl font-mono font-bold text-cyber-heading leading-none">{risk.score}</div>
        <div className="text-[0.6875rem] font-mono text-cyber-muted">/ 100</div>
        <span className={`ml-auto px-2 py-0.5 rounded border text-[0.6875rem] font-mono font-bold ${color}`}>{risk.level}</span>
      </div>

      <div className="h-2.5 rounded-full bg-cyber-surface-hover overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            risk.level === "Critical" ? "bg-red-500" : risk.level === "High" ? "bg-orange-500" : risk.level === "Medium" ? "bg-yellow-500" : "bg-sky-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 text-[0.75rem]">
        <Fact label="Business impact" value={risk.business_impact} />
        <Fact label="Compliance impact" value={risk.compliance_impact} />
        <Fact label="Likelihood" value={risk.likelihood} />
      </div>

      <div className="rounded-md border border-emerald-800/40 bg-status-success/10 px-3 py-2 text-[0.75rem] text-status-success">
        {risk.overall}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">{label}</div>
      <p className="text-cyber-muted leading-snug">{value}</p>
    </div>
  );
}
