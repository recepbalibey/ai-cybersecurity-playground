"use client";

import React from "react";
import { Crosshair, Eye, Bot, ShieldCheck } from "lucide-react";
import type { PrivacyFinding } from "@/services/privacyScanner";

const SEVERITY_BADGE: Record<string, string> = {
  Critical: "bg-red-950/50 text-red-300 border-red-500/60",
  High: "bg-orange-950/50 text-orange-300 border-orange-500/60",
  Medium: "bg-yellow-950/50 text-yellow-300 border-yellow-500/60",
  Low: "bg-sky-950/50 text-sky-300 border-sky-500/60",
  Informational: "bg-slate-800/50 text-slate-300 border-slate-600",
};

interface Props {
  finding: PrivacyFinding;
}

export function PrivacyFindingDetail({ finding }: Props) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-3">
        <Crosshair className="w-5 h-5 text-red-400" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-cyber-heading">{finding.type}</h3>
          <div className="text-[11px] font-mono text-cyber-muted">{finding.snippet}</div>
        </div>
        <span className={`ml-auto px-2 py-0.5 rounded border text-[10px] font-mono shrink-0 ${SEVERITY_BADGE[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>

      <div className="px-4 py-3 space-y-4 text-[13px]">
        <p className="text-cyber-heading/90">{finding.explanation}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-md border border-cyber-border bg-slate-900/50 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Confidence</div>
            <div className="text-[12px] font-mono text-cyan-300 mt-0.5">{finding.confidence}</div>
          </div>
          <div className="rounded-md border border-cyber-border bg-slate-900/50 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Location</div>
            <div className="text-[12px] font-mono text-cyan-300 mt-0.5">offsets {finding.start}-{finding.end}</div>
          </div>
        </div>

        <Section icon={<Eye className="w-3.5 h-3.5 text-orange-400" />} title="Why attackers want it">
          <p className="text-cyber-muted">{finding.attacker_value}</p>
        </Section>

        <Section icon={<Bot className="w-3.5 h-3.5 text-red-400" />} title="Why AI systems should not receive it">
          <p className="text-cyber-muted">{finding.ai_risk}</p>
        </Section>

        <Section icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />} title="How organizations protect it">
          <p className="text-cyber-muted">{finding.protection}</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyber-heading">{title}</h4>
      </div>
      {children}
    </div>
  );
}
