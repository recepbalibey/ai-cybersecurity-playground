"use client";

import React, { useState } from "react";
import {
  GitBranch,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Braces,
  FileSearch,
  User,
  Brain,
  ArrowDown,
  Info,
} from "lucide-react";
import { PipelineBlock } from "@/services/llmSecuritySimulator";

interface LLMPipelineProps {
  blocks: PipelineBlock[];
  isProcessing: boolean;
}

function blockIcon(id: string) {
  switch (id) {
    case "system-prompt":
      return ShieldCheck;
    case "developer":
      return Braces;
    case "context":
      return FileSearch;
    case "user":
      return User;
    case "llm":
      return Brain;
    case "response":
      return FileText;
    default:
      return Info;
  }
}

function trustStyle(level: PipelineBlock["trustLevel"]) {
  switch (level) {
    case "trusted":
      return {
        border: "border-emerald-500/50",
        badge: "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40",
        icon: "text-emerald-400",
      };
    case "flagged":
      return {
        border: "border-red-500/60 shadow-red-glow",
        badge: "bg-red-950/60 text-red-400 border border-red-500/40",
        icon: "text-red-400",
      };
    case "untrusted":
      return {
        border: "border-slate-600",
        badge: "bg-slate-900 text-slate-400 border border-slate-700",
        icon: "text-slate-400",
      };
    case "semi-trusted":
      return {
        border: "border-amber-500/40",
        badge: "bg-amber-950/60 text-amber-400 border border-amber-500/40",
        icon: "text-amber-400",
      };
    case "model":
      return {
        border: "border-cyan-500/50",
        badge: "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40",
        icon: "text-cyan-400",
      };
    default:
      return {
        border: "border-slate-700",
        badge: "bg-slate-900 text-slate-400 border border-slate-700",
        icon: "text-slate-400",
      };
  }
}

function trustLabel(level: PipelineBlock["trustLevel"]) {
  switch (level) {
    case "trusted":
      return "TRUSTED";
    case "flagged":
      return "MALICIOUS";
    case "untrusted":
      return "UNTRUSTED";
    case "semi-trusted":
      return "SEMI-TRUSTED";
    case "model":
      return "MODEL";
    default:
      return "OUTPUT";
  }
}

export function LLMPipeline({
  blocks,
  isProcessing,
}: LLMPipelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            LLM Instruction Pipeline
          </h2>
        </div>
        <span className="text-xs text-cyber-muted font-mono uppercase">
          Trust Flow
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto bg-grid-pattern">
        {blocks.map((block, idx) => {
          const Icon = blockIcon(block.id);
          const style = trustStyle(block.trustLevel);
          const isExpanded = expandedId === block.id;

          return (
            <React.Fragment key={block.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : block.id)}
                className={`w-full p-3.5 rounded-lg border bg-slate-950/80 text-left transition-all ${
                  style.border
                } ${
                  isProcessing && block.id === "llm"
                    ? "animate-pulse"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${style.icon} shrink-0`} />
                    <span className="text-xs font-semibold text-cyber-heading">
                      {block.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${style.badge}`}
                    >
                      {trustLabel(block.trustLevel)}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
                  {block.content}
                </p>
              </button>

              {isExpanded && (
                <div className="mx-2 px-3.5 py-3 bg-slate-950/90 border border-slate-700 rounded-lg space-y-2">
                  <div className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider">
                    Layer Content
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed break-words">
                    {block.content}
                  </p>
                  <div className="flex items-start gap-2 text-[11px] text-slate-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{block.securityNotes}</span>
                  </div>
                </div>
              )}

              {idx < blocks.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}