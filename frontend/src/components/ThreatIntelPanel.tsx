"use client";

import React from "react";
import {
  ShieldAlert,
  Globe,
  User,
  Terminal,
  Server,
} from "lucide-react";
import { IOCs, MitreMapping } from "@/services/aiAnalyst";
import { ConceptChip } from "@/components/effects/ConceptChip";

interface ThreatIntelPanelProps {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  iocs: IOCs;
  mitreMappings: MitreMapping[];
}

export function ThreatIntelPanel({
  severity,
  iocs,
  mitreMappings,
}: ThreatIntelPanelProps) {
  const getSeverityBadge = () => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-950/60 border-red-500/60 text-red-400 shadow-red-glow";
      case "HIGH":
        return "bg-orange-950/60 border-orange-500/60 text-orange-400";
      case "MEDIUM":
        return "bg-amber-950/60 border-amber-500/60 text-amber-400";
      default:
        return "bg-blue-950/60 border-blue-500/60 text-blue-400";
    }
  };

  return (
    <div className="cyber-panel flex flex-col h-full border border-cyber-border overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Threat Intelligence Panel
          </h2>
        </div>
        {/* Severity Badge */}
        <div
          className={`px-3 py-1 rounded border font-mono text-xs font-bold uppercase ${getSeverityBadge()}`}
        >
          SEVERITY: {severity}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Section 1: Detected Indicators of Compromise */}
        <div>
          <div className="text-xs text-cyber-muted font-mono uppercase mb-2">
            Detected Indicators of Compromise (IOCs)
          </div>

          <div className="space-y-2.5">
            {/* IP Addresses */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Origin IP Addresses ({iocs.ips.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {iocs.ips.map((ip, idx) => (
                  <span
                    key={ip}
                    style={{ animationDelay: `${idx * 70}ms` }}
                    className="decode-enter font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-medium"
                  >
                    {ip}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Accounts */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>Targeted User Accounts ({iocs.users.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {iocs.users.map((u, idx) => (
                  <span
                    key={u}
                    style={{ animationDelay: `${idx * 70}ms` }}
                    className="decode-enter font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-medium"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Systems */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Target Systems ({iocs.hosts.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {iocs.hosts.map((h, idx) => (
                  <span
                    key={h}
                    style={{ animationDelay: `${idx * 70}ms` }}
                    className="decode-enter font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Executable Commands */}
            {iocs.commands.length > 0 && (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1.5">
                  <Terminal className="w-4 h-4 text-red-400" />
                  <span>Suspicious Commands ({iocs.commands.length})</span>
                </div>
                <div className="space-y-1.5">
                  {iocs.commands.map((cmd, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-xs p-2 rounded bg-slate-900 border border-slate-800 text-red-300 truncate"
                    >
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: MITRE ATT&CK Mapping */}
        <div className="flex-1">
          <div className="text-xs text-cyber-muted font-mono uppercase mb-2 flex items-center justify-between">
            <span>
              MITRE ATT&CK Mapping{" "}
              <ConceptChip
                label="why mapping matters"
                topicId="detection"
                className="ml-1 text-[11px] normal-case"
              />
            </span>
            <span>{mitreMappings.length} Techniques Mapped</span>
          </div>

          <div className="space-y-2.5">
            {mitreMappings.map((technique, idx) => (
              <div
                key={technique.id}
                style={{ animationDelay: `${120 + idx * 90}ms` }}
                className="decode-enter p-3.5 bg-slate-950/80 border border-slate-800 rounded holo-panel hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/30 rounded">
                    {technique.id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: {technique.confidence}
                  </span>
                </div>

                <div className="text-sm font-semibold text-cyber-heading mb-0.5">
                  {technique.name}
                </div>
                <div className="text-xs text-cyber-muted font-mono mb-1.5">
                  Tactic: {technique.tactic}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {technique.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
