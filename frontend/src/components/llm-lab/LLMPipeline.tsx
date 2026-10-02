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
        badge: "bg-status-success/10 text-status-success border border-emerald-500/40",
        icon: "text-status-success",
      };
    case "flagged":
      return {
        border: "border-red-500/60 shadow-red-glow",
        badge: "bg-status-danger/10 text-status-danger border border-red-500/40",
        icon: "text-status-danger",
      };
    case "untrusted":
      return {
        border: "border-cyber-border",
        badge: "bg-cyber-base text-cyber-muted border border-cyber-border",
        icon: "text-cyber-muted",
      };
    case "semi-trusted":
      return {
        border: "border-amber-500/40",
        badge: "bg-status-warning/10 text-status-warning border border-amber-500/40",
        icon: "text-status-warning",
      };
    case "model":
      return {
        border: "border-cyan-500/50",
        badge: "bg-accent/10 text-accent border border-cyan-500/40",
        icon: "text-accent",
      };
    default:
      return {
        border: "border-cyber-border",
        badge: "bg-cyber-base text-cyber-muted border border-cyber-border",
        icon: "text-cyber-muted",
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
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
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
                className={`w-full p-3.5 rounded-lg border bg-cyber-base/80 text-left transition-all ${
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
                      className={`text-[0.625rem] font-mono px-2 py-0.5 rounded font-bold ${style.badge}`}
                    >
                      {trustLabel(block.trustLevel)}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-cyber-muted transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
                <p className="text-[0.6875rem] text-cyber-muted mt-1 font-mono truncate">
                  {block.content}
                </p>
              </button>

              {isExpanded && (
                <div className="mx-2 px-3.5 py-3 bg-cyber-base/90 border border-cyber-border rounded-lg space-y-2">
                  <div className="text-[0.625rem] font-bold text-accent font-mono uppercase tracking-wider">
                    Layer Content
                  </div>
                  <p className="text-xs text-cyber-text leading-relaxed break-words">
                    {block.content}
                  </p>
                  <div className="flex items-start gap-2 text-[0.6875rem] text-cyber-muted">
                    <ShieldAlert className="w-3.5 h-3.5 text-status-warning shrink-0 mt-0.5" />
                    <span>{block.securityNotes}</span>
                  </div>
                </div>
              )}

              {idx < blocks.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-4 h-4 text-cyber-muted" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}