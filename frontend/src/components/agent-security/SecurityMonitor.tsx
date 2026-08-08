"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Ban, Activity, FileWarning } from "lucide-react";
import { MissionResult } from "@/services/agentSecurity";

interface SecurityMonitorProps {
  result: MissionResult | null;
  isProcessing: boolean;
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: "ok" | "warn" | "bad" | "idle" }) {
  const cls =
    tone === "ok"
      ? "text-emerald-400"
      : tone === "warn"
      ? "text-amber-400"
      : tone === "bad"
      ? "text-rose-400"
      : "text-cyber-muted";
  return (
    <div className="flex flex-col items-center justify-center p-2.5 rounded-md bg-slate-950/60 border border-slate-800">
      <span className={`text-lg font-bold font-mono ${cls}`}>{value}</span>
      <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

export function SecurityMonitor({ result, isProcessing }: SecurityMonitorProps) {
  const risk = result?.outcome === "safe_complete" ? "LOW" : result?.outcome === "blocked_excess" ? "HIGH" : "MEDIUM";
  const riskTone =
    risk === "LOW" ? "ok" : risk === "HIGH" ? "bad" : "warn";
  const blockedCount = result?.blocked_count ?? 0;
  const activeControls = result?.active_controls.length ?? 0;
  const executed = result?.tools_executed ?? 0;
  const events = result?.events ?? [];

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <ShieldAlert className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Security Monitor
        </h3>
      </div>

      {/* Risk meter */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Current Risk</span>
          <span className={`text-xs font-bold font-mono ${riskTone === "ok" ? "text-emerald-400" : riskTone === "bad" ? "text-rose-400" : "text-amber-400"}`}>
            {risk}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              riskTone === "ok" ? "bg-emerald-500" : riskTone === "bad" ? "bg-rose-500" : "bg-amber-500"
            }`}
            style={{ width: risk === "LOW" ? "25%" : risk === "HIGH" ? "85%" : "55%" }}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="Tools Executed" value={executed} tone={executed ? "ok" : "idle"} />
        <Metric label="Blocked Actions" value={blockedCount} tone={blockedCount ? "bad" : "ok"} />
        <Metric label="Active Controls" value={activeControls} tone={activeControls ? "ok" : "warn"} />
      </div>

      {/* Security events feed */}
      <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider mb-1.5">
        Security Events
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {events.length === 0 && !isProcessing && (
          <p className="text-[11px] font-mono text-cyber-muted py-4 text-center">
            No activity yet. Run a mission to stream security events.
          </p>
        )}
        {events.map((e, i) => {
          const isBlock = e.kind === "blocked" || e.kind === "policy_block";
          const isAllow = e.kind === "policy_allow" || e.kind === "tool";
          const isObs = e.kind === "observation";
          return (
            <div
              key={i}
              className={`flex items-start gap-2 px-2.5 py-1.5 rounded-md border ${
                isBlock
                  ? "bg-rose-950/20 border-rose-500/30"
                  : isAllow
                  ? "bg-emerald-950/10 border-emerald-500/20"
                  : isObs
                  ? "bg-slate-950/50 border-slate-800"
                  : "bg-slate-950/40 border-slate-800"
              }`}
            >
              <span className="mt-0.5">
                {isBlock ? (
                  <Ban className="w-3 h-3 text-rose-400 shrink-0" />
                ) : isAllow ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : isObs ? (
                  <Activity className="w-3 h-3 text-cyan-400 shrink-0" />
                ) : (
                  <FileWarning className="w-3 h-3 text-cyan-500 shrink-0" />
                )}
              </span>
              <span className={`text-[10px] font-mono leading-snug ${isBlock ? "text-rose-300" : "text-cyber-text"}`}>
                {e.detail}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}