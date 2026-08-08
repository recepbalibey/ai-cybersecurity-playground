"use client";

import React from "react";
import {
  ShieldCheck,
  Radio,
  FileText,
  AlertTriangle,
  ArrowDown,
} from "lucide-react";
import { TrustAnalysis } from "@/services/llmSecuritySimulator";

interface AttackFlowVisualizationProps {
  systemPrompt: string;
  knowledgeBase: string;
  userPayload: string;
  modelResponse: string;
  defenseLayers: { name: string; active: boolean }[];
  trusted: TrustAnalysis[];
  mode: "vulnerable" | "protected";
}

function nodeBadge(status: TrustAnalysis["status"]) {
  switch (status) {
    case "trusted":
      return {
        label: "TRUSTED",
        cls: "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40",
      };
    case "flagged":
      return {
        label: "MALICIOUS",
        cls: "bg-red-950/60 text-red-400 border border-red-500/40",
      };
    default:
      return {
        label: "NEUTRAL",
        cls: "bg-slate-900 text-slate-400 border border-slate-700",
      };
  }
}

export function AttackFlowVisualization({
  systemPrompt,
  knowledgeBase,
  userPayload,
  modelResponse,
  defenseLayers,
  trusted,
  mode,
}: AttackFlowVisualizationProps) {
  const activeDefenses = defenseLayers.filter((d) => d.active).length;

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Attack Flow Visualization
          </h2>
        </div>
        <span className="text-xs font-mono text-cyber-muted">
          {activeDefenses}/{defenseLayers.length} guards active
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* Trust boundary snapshot */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
          {trusted.map((t, idx) => {
            const b = nodeBadge(t.status);
            return (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-300">
                  {t.layer}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${b.cls}`}
                >
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Flow stages */}
        <div className="space-y-1.5">
          <Stage
            icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
            label="User (Injected) Payload"
            border="border-red-500/40"
            content={userPayload}
            color="text-red-300"
          />
          <Arrow />

          <Stage
            icon={<FileText className="w-4 h-4 text-amber-400" />}
            label="Retrieved Knowledge Base"
            border="border-amber-500/40"
            content={knowledgeBase}
            color="text-amber-200"
          />
          <Arrow />

          <Stage
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            label="System Prompt"
            border="border-emerald-500/40"
            content={systemPrompt}
            color="text-emerald-200"
          />
          <Arrow />

          {/* Defense junction */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider mb-1.5">
              Security Policy Layer
            </div>
            <div className="flex flex-wrap gap-1.5">
              {defenseLayers.map((d) => (
                <span
                  key={d.name}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    d.active
                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-900 text-slate-500 border-slate-700 line-through"
                  }`}
                >
                  {d.name}
                </span>
              ))}
            </div>
          </div>
          <Arrow />

          {/* Model decision */}
          <div
            className={`p-3.5 rounded-lg border ${
              mode === "protected"
                ? "bg-emerald-950/20 border-emerald-500/50"
                : "bg-red-950/20 border-red-500/50"
            }`}
          >
            <div
              className={`text-[11px] font-bold font-mono uppercase tracking-wider mb-1 ${
                mode === "protected" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {mode === "protected" ? "Injection Blocked" : "Instruction Executed"}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {modelResponse}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stage({
  icon,
  label,
  content,
  border,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
  border: string;
  color: string;
}) {
  return (
    <div className={`p-3 bg-slate-950/70 border rounded-lg ${border}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <ArrowDown className="w-3.5 h-3.5 text-slate-600 ml-auto" />
      </div>
      <p
        className={`text-[11px] font-mono leading-snug break-all ${color}`}
      >
        {content || "-"}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center">
      <ArrowDown className="w-4 h-4 text-slate-600" />
    </div>
  );
}