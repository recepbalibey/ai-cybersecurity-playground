"use client";

import React from "react";
import { Clock, Eye, ListChecks, Lightbulb } from "lucide-react";
import type { ReviewComparison } from "@/services/securityCodeReviewer";

const MANUAL = { time_seconds: 840, issues: 4, coverage: "Sampled key lines only" };
const AI = { time_seconds: 12, issues: 6, coverage: "Full file, 30+ patterns" };

function formatTime(sec: number) {
  return sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
}

interface Props {
  comparison?: ReviewComparison;
  hasResult: boolean;
}

export function ReviewComparisonPanel({ comparison, hasResult }: Props) {
  const m = comparison?.manual ?? MANUAL;
  const a = comparison?.ai ?? AI;
  const ratio = comparison?.time_saved_ratio ?? 0;

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <Eye className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Manual vs AI Review</h3>
      </div>

      <div className="grid grid-cols-2 divide-x divide-cyber-border">
        <ReviewColumn label="Manual review" accent="text-slate-300" icon={<Clock className="w-3.5 h-3.5" />}
          time={formatTime(m.time_seconds)} issues={m.issues} coverage={m.coverage} />
        <ReviewColumn label="AI review" accent="text-cyan-300" icon={<ListChecks className="w-3.5 h-3.5" />}
          time={formatTime(a.time_seconds)} issues={a.issues} coverage={a.coverage} />
      </div>

      <div className="px-4 py-3 border-t border-cyber-border bg-slate-900/40 flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-[12px] text-cyber-muted leading-relaxed">
          {hasResult
            ? "AI scanned every line and found issues a sampled manual read missed. AI assists, it does not replace the human review."
            : "AI scans the whole file for many patterns; a manual read samples key lines. Use AI to widen coverage, then verify."}
          {ratio > 0 && <span className="text-cyan-300 font-mono"> Time saved ~{ratio}x.</span>}
        </p>
      </div>
    </div>
  );
}

function ReviewColumn({ label, accent, icon, time, issues, coverage }: {
  label: string; accent: string; icon: React.ReactNode; time: string; issues: number; coverage: string;
}) {
  return (
    <div className="px-4 py-3 space-y-2">
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${accent}`}>
        {icon} {label}
      </div>
      <div>
        <div className="text-[20px] font-mono font-bold text-cyber-heading leading-none">{time}</div>
        <div className="text-[10px] font-mono text-cyber-muted mt-1">time on a small file</div>
      </div>
      <div className="text-[12px] text-cyber-muted">
        <span className="text-cyber-heading font-semibold">{issues} issues</span> found
      </div>
      <div className="text-[11px] text-cyber-muted">{coverage}</div>
    </div>
  );
}