"use client";

import React from "react";
import { Brain, CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";
import { MissionResult, GraphNode } from "@/services/agentSecurity";

interface AgentBrainProps {
  result: MissionResult | null;
  isProcessing: boolean;
  activeStage: string | null;
}

const NODE_ICONS: Record<string, string> = {
  planner: "PLAN",
  memory: "MEM",
  tool: "TOOL",
  decision: "DEC",
  output: "OUT",
  policy_engine: "POL",
};

export function AgentBrain({ result, isProcessing, activeStage }: AgentBrainProps) {
  const graph: GraphNode[] = result?.graph ?? [];

  const nodeColor = (n: GraphNode) => {
    if (n.status === "blocked") return "border-rose-500/50 text-rose-300 bg-rose-950/40";
    if (n.status === "flagged") return "border-amber-500/50 text-amber-300 bg-amber-950/40";
    return "border-cyan-500/40 text-cyan-200 bg-cyan-950/30";
  };

  const isActive = (i: number) =>
    isProcessing && activeStage === `graph_${i}`;

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <Brain className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Agent Brain
        </h3>
        <span className="ml-auto text-[10px] font-mono text-cyber-muted">
          {isProcessing ? "EXECUTING" : result ? "COMPLETE" : "IDLE"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {graph.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 mb-3">
              <Clock className="w-5 h-5 text-cyber-muted" />
            </div>
            <p className="text-[11px] font-mono text-cyber-muted">
              Set a goal and run a mission to watch the agent plan, choose tools, and decide.
            </p>
          </div>
        )}

        {graph.map((n, i) => {
          const Icon = n.status === "blocked" ? XCircle : n.status === "flagged" ? XCircle : CheckCircle2;
          return (
            <div key={i}>
              <div
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                  isActive(i)
                    ? "border-cyan-400/80 bg-cyan-950/50 shadow-cyan-glow scale-[1.01]"
                    : nodeColor(n)
                }`}
              >
                <div className="w-9 h-9 shrink-0 rounded-md bg-slate-950/70 border border-slate-700/60 flex items-center justify-center text-[10px] font-mono text-cyan-300">
                  {NODE_ICONS[n.node] ?? "NODE"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyber-heading">{n.label}</span>
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        n.status === "blocked"
                          ? "text-rose-400"
                          : n.status === "flagged"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted truncate">
                    {n.detail}
                    {n.permission && <span className="text-cyan-400/80"> · {n.permission}</span>}
                  </div>
                </div>
              </div>
              {i < graph.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-500/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}