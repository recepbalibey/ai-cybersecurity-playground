"use client";

import React, { useMemo, useState } from "react";
import { AlertOctagon, ListChecks, Play, X } from "lucide-react";
import type { CodeFinding } from "@/services/securityCodeReviewer";

const SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"] as const;
type Severity = (typeof SEVERITIES)[number];

const SEVERITY_STYLE: Record<string, string> = {
  Critical: "border-red-500/50 text-red-300",
  High: "border-orange-500/50 text-orange-300",
  Medium: "border-yellow-500/50 text-yellow-300",
  Low: "border-sky-500/50 text-sky-300",
  Informational: "border-slate-600 text-slate-300",
};

const SEVERITY_DOT: Record<string, string> = {
  Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-yellow-500",
  Low: "bg-sky-500", Informational: "bg-slate-500",
};

interface Props {
  findings: CodeFinding[];
  selectedId: string | null;
  onSelect: (f: CodeFinding) => void;
  hasResult?: boolean;
}

export function FindingsPanel({ findings, selectedId, onSelect, hasResult = false }: Props) {
  const [filter, setFilter] = useState<Severity | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
    for (const f of findings) c[f.severity] = (c[f.severity] ?? 0) + 1;
    return c;
  }, [findings]);

  const visible = useMemo(
    () => (filter ? findings.filter((f) => f.severity === filter) : findings),
    [findings, filter]
  );

  if (findings.length === 0) {
    return (
      <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-cyber-border flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">AI Findings</h3>
          <span className="ml-auto text-[10px] font-mono text-cyber-muted">0 issues</span>
        </div>
        <div className={`flex items-center gap-3 p-4 text-sm ${hasResult ? "text-emerald-300" : "text-cyber-muted"}`}>
          {hasResult ? (
            <ListChecks className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <div>
            <div className={`font-semibold ${hasResult ? "" : "text-cyber-heading"}`}>
              {hasResult ? "No vulnerabilities detected" : "No review run yet"}
            </div>
            <div className="text-xs text-cyber-muted">
              {hasResult
                ? "Pattern review completed. Confirm with a human code review."
                : "Run a review to scan this code for security patterns."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-cyber-border flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">AI Findings</h3>
        <span className="ml-auto text-[10px] font-mono text-cyber-muted">
          {visible.length}/{findings.length} issue(s)
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-cyber-border px-2 py-1.5">
        {SEVERITIES.map((sev) => {
          const active = filter === sev;
          return (
            <button
              key={sev}
              onClick={() => setFilter(active ? null : sev)}
              aria-pressed={active}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                active ? SEVERITY_STYLE[sev] : "border-cyber-border text-cyber-muted hover:border-cyber-border-light hover:text-cyber-text"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[sev]}`} />
              {sev}
              <span className={active ? "" : "text-cyber-muted/70"}>{counts[sev]}</span>
            </button>
          );
        })}
        {filter && (
          <button
            onClick={() => setFilter(null)}
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyber-muted transition-colors hover:text-cyber-text"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      {visible.length === 0 && filter ? (
        <div className="flex items-center gap-2.5 p-4 text-sm text-cyber-muted">
          <X className="h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium text-cyber-heading">No {filter.toLowerCase()} findings</div>
            <div className="text-xs text-cyber-muted">
              {findings.length} finding{findings.length === 1 ? "" : "s"} found at other severities. Clear the filter to see them.
            </div>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-cyber-border">
        {visible.map((f) => {
          const active = f.id === selectedId;
          return (
            <li key={f.id}>
              <button
                onClick={() => onSelect(f)}
                className={`w-full text-left px-3 py-2.5 hover:bg-slate-800/40 transition-colors flex gap-3 ${
                  active ? "bg-slate-800/50 border-l-2 border-l-cyan-500" : "border-l-2 border-l-transparent"
                }`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[f.severity]}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-semibold text-cyber-heading">{f.title}</span>
                    <span className={`text-[10px] font-mono px-1 py-0.5 rounded border ${SEVERITY_STYLE[f.severity]}`}>
                      {f.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyber-muted mt-0.5">
                    {f.language} - lines {f.affected_lines.start}-{f.affected_lines.end}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        </ul>
      )}
    </div>
  );
}