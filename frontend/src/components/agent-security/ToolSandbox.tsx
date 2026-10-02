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
      ? "border-rose-500/40 text-status-danger"
      : r === "medium"
      ? "border-amber-500/40 text-status-warning"
      : "border-emerald-500/40 text-status-success";

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <Wrench className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-cyber-heading">
          Tool Sandbox
        </h3>
        <span className="ml-auto text-[0.625rem] font-mono text-cyber-muted">
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
                  ? "bg-status-danger/10 border-rose-500/40"
                  : used
                  ? "bg-accent/10 border-cyan-500/40"
                  : "bg-cyber-base/60 border-cyber-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyber-heading">{t.name}</span>
                <span className={`text-[0.625rem] font-mono px-1.5 py-0.5 rounded border ${riskCls(t.risk)}`}>
                  {t.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-[0.625rem] text-cyber-muted mt-1 leading-relaxed">{t.description}</p>
              <div className="flex items-center justify-between mt-2 text-[0.625rem] font-mono">
                <span className="text-accent">{t.permission}</span>
                <span className={`flex items-center gap-1 ${blocked ? "text-status-danger" : used ? "text-status-success" : "text-cyber-muted"}`}>
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