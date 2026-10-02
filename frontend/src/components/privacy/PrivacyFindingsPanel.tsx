"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, FileWarning } from "lucide-react";
import type { PrivacyFinding } from "@/services/privacyScanner";

const SEVERITY_STYLE: Record<string, string> = {
  Critical: "border-red-500/60 text-status-danger",
  High: "border-orange-500/60 text-status-warning",
  Medium: "border-yellow-500/60 text-status-warning",
  Low: "border-sky-500/60 text-status-info",
  Informational: "border-cyber-border text-cyber-text",
};

const SEVERITY_DOT: Record<string, string> = {
  Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-yellow-500",
  Low: "bg-sky-500", Informational: "bg-cyber-surface-hover",
};

interface Props {
  findings: PrivacyFinding[];
  selectedId: string | null;
  onSelect: (f: PrivacyFinding) => void;
  document: string;
}

export function PrivacyFindingsPanel({ findings, selectedId, onSelect, document }: Props) {
  if (findings.length === 0) {
    return (
      <div className="cyber-panel border border-cyber-border rounded-lg p-4 flex items-center gap-3 text-sm text-status-success">
        <ShieldCheck className="w-5 h-5" />
        <div>
          <div className="font-semibold">No sensitive data detected</div>
          <div className="text-xs text-cyber-muted">Pattern scan complete. Confirm with a human review before sending.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-3 py-2 border-b border-cyber-border flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-status-danger" />
        <h3 className="text-xs font-bold text-cyber-heading">Privacy Findings</h3>
        <span className="ml-auto text-[0.625rem] font-mono text-cyber-muted">{findings.length} item(s)</span>
      </div>
      <ul className="divide-y divide-cyber-border overflow-auto flex-1">
        {findings.map((f) => {
          const active = f.id === selectedId;
          const line = lineOf(f.start, document);
          return (
            <li key={f.id}>
              <button
                onClick={() => onSelect(f)}
                className={`w-full text-left px-3 py-2.5 hover:bg-cyber-surface-hover/40 transition-colors flex gap-3 ${
                  active ? "bg-cyber-surface-hover/50 border-l-2 border-l-cyan-500" : "border-l-2 border-l-transparent"
                }`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[f.severity]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.75rem] font-semibold text-cyber-heading">{f.type}</span>
                    <span className={`text-[0.625rem] font-mono px-1 py-0.5 rounded border ${SEVERITY_STYLE[f.severity]}`}>
                      {f.severity}
                    </span>
                  </div>
                  <div className="text-[0.6875rem] text-cyber-muted mt-0.5 flex items-center gap-1.5">
                    <FileWarning className="w-3 h-3" />
                    {f.snippet} {line > 0 && <span className="font-mono text-cyber-muted">- line {line}</span>}
                  </div>
                </div>
                <span className="text-[0.625rem] font-mono text-cyber-muted self-center">{f.confidence} conf</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function lineOf(offset: number, document: string): number {
  if (!document) return 0;
  return document.slice(0, offset).split("\n").length;
}
