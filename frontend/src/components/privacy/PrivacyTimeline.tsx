"use client";

import React from "react";
import { ScanLine } from "lucide-react";
import type { TimelineStage } from "@/services/privacyScanner";

interface Props {
  stages: TimelineStage[];
  isProcessing: boolean;
  activeStage: number | null;
}

const ICONS = ["FileSearch", "Fingerprint", "Tags", "Gavel", "ShieldOff", "Send"] as const;

function StageIcon({ name, active, done }: { name: string; active: boolean; done: boolean }) {
  const color = done ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : active ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-pulse" : "bg-slate-800/60 text-slate-500 border-slate-700";
  const glyph =
    name === "FileSearch" ? "1" : name === "Fingerprint" ? "2" : name === "Tags" ? "3" : name === "Gavel" ? "4" : name === "ShieldOff" ? "5" : "6";
  return (
    <span className={`w-6 h-6 rounded-md border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${color}`}>
      {done ? "\u2713" : glyph}
    </span>
  );
}

export function PrivacyTimeline({ stages, isProcessing, activeStage }: Props) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <ScanLine className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Protection Pipeline</h3>
        {isProcessing && <span className="ml-auto text-[10px] font-mono text-cyan-300 animate-pulse">running</span>}
      </div>
      <ul className="p-3 space-y-2">
        {stages.map((s, i) => {
          const done = activeStage !== null ? i < activeStage : !isProcessing;
          const active = activeStage !== null && i === activeStage;
          return (
            <li key={s.step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StageIcon name={ICONS[i] ?? "Send"} active={active} done={done} />
                {i < stages.length - 1 && <span className={`w-px flex-1 my-1 ${done ? "bg-emerald-500/40" : "bg-cyber-border"}`} />}
              </div>
              <div className="min-w-0 pb-2">
                <div className={`text-[12px] font-semibold ${done ? "text-cyber-heading" : active ? "text-cyan-300" : "text-slate-500"}`}>
                  {s.name}
                </div>
                <div className="text-[11px] text-cyber-muted leading-snug">{s.detail}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
