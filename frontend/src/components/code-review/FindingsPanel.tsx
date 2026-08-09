"use client";

import React from "react";
import { AlertOctagon, ListChecks, Play } from "lucide-react";
import type { CodeFinding } from "@/services/securityCodeReviewer";

const SEVERITY_STYLE: Record<string, string> = {
  Critical: "border-red-500/60 text-red-300",
  High: "border-orange-500/60 text-orange-300",
  Medium: "border-yellow-500/60 text-yellow-300",
  Low: "border-sky-500/60 text-sky-300",
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
        <span className="ml-auto text-[10px] font-mono text-cyber-muted">{findings.length} issue(s)</span>
      </div>
      <ul className="divide-y divide-cyber-border">
        {findings.map((f) => {
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
    </div>
  );
}