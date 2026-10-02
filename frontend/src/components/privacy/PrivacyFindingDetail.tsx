"use client";

import React from "react";
import { Crosshair, Eye, Bot, ShieldCheck } from "lucide-react";
import type { PrivacyFinding } from "@/services/privacyScanner";

const SEVERITY_BADGE: Record<string, string> = {
  Critical: "bg-status-danger/10 text-status-danger border-red-500/60",
  High: "bg-status-warning/10 text-status-warning border-orange-500/60",
  Medium: "bg-status-warning/10 text-status-warning border-yellow-500/60",
  Low: "bg-status-info/10 text-status-info border-sky-500/60",
  Informational: "bg-cyber-surface-hover/50 text-cyber-text border-cyber-border",
};

interface Props {
  finding: PrivacyFinding;
}

export function PrivacyFindingDetail({ finding }: Props) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-3">
        <Crosshair className="w-5 h-5 text-status-danger" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-cyber-heading">{finding.type}</h3>
          <div className="text-[0.6875rem] font-mono text-cyber-muted">{finding.snippet}</div>
        </div>
        <span className={`ml-auto px-2 py-0.5 rounded border text-[0.625rem] font-mono shrink-0 ${SEVERITY_BADGE[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>

      <div className="px-4 py-3 space-y-4 text-[0.8125rem]">
        <p className="text-cyber-heading">{finding.explanation}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-md border border-cyber-border bg-cyber-base/50 px-3 py-2">
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">Confidence</div>
            <div className="text-[0.75rem] font-mono text-accent mt-0.5">{finding.confidence}</div>
          </div>
          <div className="rounded-md border border-cyber-border bg-cyber-base/50 px-3 py-2">
            <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">Location</div>
            <div className="text-[0.75rem] font-mono text-accent mt-0.5">offsets {finding.start}-{finding.end}</div>
          </div>
        </div>

        <Section icon={<Eye className="w-3.5 h-3.5 text-status-warning" />} title="Why attackers want it">
          <p className="text-cyber-muted">{finding.attacker_value}</p>
        </Section>

        <Section icon={<Bot className="w-3.5 h-3.5 text-status-danger" />} title="Why AI systems should not receive it">
          <p className="text-cyber-muted">{finding.ai_risk}</p>
        </Section>

        <Section icon={<ShieldCheck className="w-3.5 h-3.5 text-status-success" />} title="How organizations protect it">
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
        <h4 className="text-[0.6875rem] font-bold text-cyber-heading">{title}</h4>
      </div>
      {children}
    </div>
  );
}
