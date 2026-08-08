"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, Terminal, User, Server } from "lucide-react";
import { ThreatFinding } from "@/services/threatHunter";

interface ThreatFindingsProps {
  findings: ThreatFinding[];
  qualityScore: number;
  confidence: string;
}

export function ThreatFindings({
  findings,
  qualityScore,
  confidence,
}: ThreatFindingsProps) {
  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Threat Hunting Findings
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
            QUALITY SCORE: {qualityScore}%
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
            CONFIDENCE: {confidence}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="text-xs text-cyber-muted font-mono uppercase mb-1">
          Discovered Suspicious Behaviors ({findings.length})
        </div>

        <div className="space-y-3">
          {findings.map((f, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg hover:border-cyan-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cyber-heading">
                  {f.title}
                </span>
                <span
                  className={`relative text-xs font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    f.severity === "CRITICAL"
                      ? "alert-ping bg-red-950/60 text-red-400 border border-red-500/40"
                      : "bg-orange-950/60 text-orange-400 border border-orange-500/40"
                  }`}
                >
                  {f.severity}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>User: {f.user}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Host: {f.host}</span>
                </div>
              </div>

              <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-red-300 break-all">
                Evidence: {f.evidence}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-cyber-muted pt-1">
                <span>MITRE ATT&CK: {f.mitre}</span>
                <span className="text-cyan-400 font-semibold">
                  VERIFIED ANOMALY
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
