"use client";

import React from "react";
import { ShieldAlert, Target, GraduationCap, ClipboardCheck } from "lucide-react";
import type { CodeFinding } from "@/services/securityCodeReviewer";

const SEVERITY_BADGE: Record<string, string> = {
  Critical: "bg-status-danger/10 text-status-danger border-red-500/60",
  High: "bg-status-warning/10 text-status-warning border-orange-500/60",
  Medium: "bg-status-warning/10 text-status-warning border-yellow-500/60",
  Low: "bg-status-info/10 text-status-info border-sky-500/60",
  Informational: "bg-cyber-surface-hover/50 text-cyber-text border-cyber-border",
};

interface Props {
  finding: CodeFinding;
}

export function FindingDetailPanel({ finding }: Props) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-status-danger" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-cyber-heading">{finding.title}</h3>
          <div className="text-[0.6875rem] font-mono text-cyber-muted">
            {finding.language} - lines {finding.affected_lines.start}-{finding.affected_lines.end}
          </div>
        </div>
        <span className={`ml-auto px-2 py-0.5 rounded border text-[0.625rem] font-mono shrink-0 ${SEVERITY_BADGE[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>

      <div className="px-4 py-3 space-y-4 text-[0.8125rem]">
        <p className="text-cyber-heading">{finding.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Tag label="OWASP" value={finding.owasp} />
          <Tag label="CWE" value={finding.cwe} />
        </div>

        <Section icon={<Target className="w-3.5 h-3.5 text-status-danger" />} title="Why it is dangerous">
          <p className="text-cyber-muted">{finding.why_dangerous}</p>
        </Section>

        <Section icon={<ShieldAlert className="w-3.5 h-3.5 text-status-warning" />} title="Impact">
          <p className="text-cyber-muted">{finding.impact}</p>
        </Section>

        <Section icon={<ClipboardCheck className="w-3.5 h-3.5 text-status-success" />} title="Recommended fix">
          <p className="text-cyber-muted">{finding.fix}</p>
        </Section>

        <div className="rounded-md border border-emerald-800/40 bg-status-success/10 px-3 py-2">
          <div className="text-[0.625rem] font-mono uppercase tracking-wider text-status-success mb-1">Secure example</div>
          <pre className="text-[0.75rem] font-mono text-status-success whitespace-pre-wrap">{finding.secure_example}</pre>
        </div>

        <Section icon={<GraduationCap className="w-3.5 h-3.5 text-accent" />} title="Learning notes">
          <ul className="list-disc pl-4 space-y-1 text-cyber-muted">
            {finding.learning_notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Section>

        {finding.checklist.length > 0 && (
          <Section icon={<ClipboardCheck className="w-3.5 h-3.5 text-status-info" />} title="Review checklist">
            <ul className="list-none space-y-1 text-cyber-muted">
              {finding.checklist.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-status-info">-</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-cyber-border bg-cyber-base/50 px-3 py-2">
      <div className="text-[0.625rem] font-mono uppercase tracking-wider text-cyber-muted">{label}</div>
      <div className="text-[0.75rem] font-mono text-accent mt-0.5">{value}</div>
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