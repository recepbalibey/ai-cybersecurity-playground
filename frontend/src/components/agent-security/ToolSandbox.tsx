"use client";

import React from "react";
import { Wrench, ShieldAlert, Activity } from "lucide-react";
import { AgentTool, MissionResult } from "@/services/agentSecurity";

interface ToolSandboxProps {
  tools: AgentTool[];
  result: MissionResult | null;
  isProcessing: boolean;
}

export function ToolSandbox({ tools, result, isProcessing }: ToolSandboxProps) {
  const usedSet = new Set(result?.tools_used ?? []);
  const blockedSet = new Set(
    (result?.blocked_count ? result.violations : [])
      .map((v) => v.tool)
      .filter((t): t is string => !!t)
  );

  const riskCls = (r: string) =>
    r === "high"
      ? "border-rose-500/40 text-rose-400"
      : r === "medium"
      ? "border-amber-500/40 text-amber-400"
      : "border-emerald-500/40 text-emerald-400";

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <Wrench className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Tool Sandbox
        </h3>
        <span className="ml-auto text-[10px] font-mono text-cyber-muted">
          {tools.length} tools
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {tools.map((t) => {
          const used = usedSet.has(t.key);
          const blocked = blockedSet.has(t.key);
          const lastExec = used ? "this mission" : blocked ? "denied" : "-";
          return (
            <div
              key={t.key}
              className={`p-3 rounded-lg border transition-all ${
                blocked
                  ? "bg-rose-950/20 border-rose-500/40"
                  : used
                  ? "bg-cyan-950/20 border-cyan-500/40"
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyber-heading">{t.name}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${riskCls(t.risk)}`}>
                  {t.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-cyber-muted mt-1 leading-relaxed">{t.description}</p>
              <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                <span className="text-cyan-400/80">{t.permission}</span>
                <span className={`flex items-center gap-1 ${blocked ? "text-rose-400" : used ? "text-emerald-400" : "text-slate-500"}`}>
                  {isProcessing && used ? (
                    <Activity className="w-3 h-3 animate-pulse" />
                  ) : blocked ? (
                    <ShieldAlert className="w-3 h-3" />
                  ) : (
                    <Activity className="w-3 h-3" />
                  )}
                  {lastExec}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}