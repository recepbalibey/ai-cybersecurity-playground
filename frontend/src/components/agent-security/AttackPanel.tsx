"use client";

import React from "react";
import { Swords, GitCompareArrows, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { MissionResult, AgentCategory } from "@/services/agentSecurity";

interface AttackPanelProps {
  result: MissionResult | null;
  protectedResult: MissionResult | null;
  compare: boolean;
  onToggleCompare: () => void;
  isProcessing: boolean;
}

export function AttackPanel({
  result,
  protectedResult,
  compare,
  onToggleCompare,
  isProcessing,
}: AttackPanelProps) {
  const riskFactors: Record<AgentCategory, { name: string; severity: string }> = {
    prompt_injection: { name: "Indirect Prompt Injection", severity: "Critical" },
    memory_poisoning: { name: "Memory Poisoning", severity: "High" },
    excessive_permissions: { name: "Excessive Permissions", severity: "High" },
    permission: { name: "Permission Escalation Attempt", severity: "Medium" },
    safe: { name: "No attack — benign mission", severity: "None" },
  };

  const rf = result ? riskFactors[result.category] : undefined;
  const outcomeOk = result?.outcome === "safe_complete";

  const riskName = rf?.name ?? "Unknown attack";
  const riskSeverity = rf?.severity ?? "—";

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <Swords className="w-4 h-4 text-rose-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Attack & Compare
        </h3>
        <button
          onClick={onToggleCompare}
          disabled={isProcessing}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-mono font-semibold transition-all disabled:opacity-40 bg-slate-900/70 border-slate-700 text-cyber-muted hover:border-cyan-500/60 hover:text-cyan-300"
        >
          <GitCompareArrows className="w-3.5 h-3.5" />
          {compare ? "Hide Compare" : "Compare Protected"}
        </button>
      </div>

      {/* Attack summary */}
      {result ? (
        <div
          className={`p-3 rounded-lg border ${
            outcomeBlocker(result.outcome) ? "bg-rose-950/20 border-rose-500/40" : "bg-emerald-950/10 border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-cyber-heading">{riskName}</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                outcomeBlocker(result.outcome) ? "border-rose-500 text-rose-400" : "border-emerald-500 text-emerald-400"
              }`}
            >
              {riskSeverity}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {outcomeBlocker(result.outcome) ? (
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className={outcomeBlocker(result.outcome) ? "text-rose-300" : "text-emerald-300"}>
              {result.outcome_label}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] font-mono text-cyber-muted py-6 text-center">
          Run a mission to see its attack class and outcome.
        </p>
      )}

      {/* Comparison */}
      {compare && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/10">
            <div className="text-[10px] font-mono text-rose-300 uppercase tracking-wider mb-2">
              Unprotected
            </div>
            <ResultLine label="Outcome" value={result?.outcome_label ?? "—"} dangerous={outcomeBlocker(result?.outcome)} />
            <ResultLine label="Tools Executed" value={String(result?.tools_executed ?? 0)} />
            <ResultLine label="Blocked" value={String(result?.blocked_count ?? 0)} />
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/10">
            <div className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider mb-2">
              Protected
            </div>
            <ResultLine label="Outcome" value={protectedResult?.outcome_label ?? "Awaiting…"} dangerous={false} />
            <ResultLine label="Tools Executed" value={String(protectedResult?.tools_executed ?? 0)} />
            <ResultLine label="Blocked" value={String(protectedResult?.blocked_count ?? 0)} />
          </div>
        </div>
      )}

      {compare && result && protectedResult && (
        <div className="mt-3 p-3 rounded-md bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-300 uppercase">Verification</span>
          </div>
          <p className="text-[10px] font-mono text-cyber-muted leading-relaxed">
            Compare the same mission with defensive controls enabled vs disabled. Notice how
            the controls convert risky outcomes into blocked or detected outcomes.
          </p>
        </div>
      )}
    </div>
  );
}

function outcomeBlocker(o?: string): boolean {
  return !!o && o !== "safe_complete";
}

function ResultLine({ label, value, dangerous }: { label: string; value: string; dangerous?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[9px] font-mono text-cyber-muted uppercase">{label}</span>
      <span className={`text-[10px] font-mono ${dangerous ? "text-rose-400" : "text-cyber-heading"}`}>{value}</span>
    </div>
  );
}