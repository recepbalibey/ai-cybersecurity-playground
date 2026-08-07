"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface HeaderProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  aiStatus: "online" | "processing" | "offline";
  activeModule?: string;
}

export function Header({
  instructorMode,
  onToggleInstructorMode,
  aiStatus,
  activeModule = "soc-analyst",
}: HeaderProps) {
  const moduleConfig = {
    "soc-analyst": {
      title: "AI SOC Analyst",
      subtitle: "Investigate security events using artificial intelligence & automated threat triaging",
      statusLabel: aiStatus === "processing" ? "AI Analyst Reasoning..." : "AI Analyst Online",
    },
    "threat-hunting": {
      title: "AI Threat Hunting Assistant",
      subtitle: "Proactively discover threats using AI-powered investigation & hypothesis-driven analysis",
      statusLabel: aiStatus === "processing" ? "Hunter AI Reasoning..." : "Hunter AI Online",
    },
    "pentest-assistant": {
      title: "AI Pentest Assistant",
      subtitle: "Plan and analyze security assessments with AI assistance",
      statusLabel: aiStatus === "processing" ? "Pentest Copilot Working..." : "Pentest Copilot Online",
    },
    "prompt-injection": {
      title: "LLM Security Laboratory",
      subtitle: "Attack and defend a simulated LLM application against prompt injection",
      statusLabel: aiStatus === "processing" ? "LLM Security Simulator Processing..." : "LLM Security Simulator Online",
    },
    "jailbreak-lab": {
      title: "Jailbreak Playground",
      subtitle: "Evaluate AI safety boundaries through controlled red team testing",
      statusLabel: aiStatus === "processing" ? "AI Red Team Environment Processing..." : "AI Red Team Environment Active",
    },
    "adversarial-ml": {
      title: "Adversarial Face Recognition Lab",
      subtitle: "Fool and harden a vision model with noise, occlusion and transformation attacks",
      statusLabel: aiStatus === "processing" ? "Vision Model Processing..." : "Vision Security Engine Online",
    },
    "agent-security": {
      title: "AI Agent Security Lab",
      subtitle: "Understand, attack and defend autonomous AI systems",
      statusLabel: aiStatus === "processing" ? "Agent Runtime Processing..." : "Agent Runtime Active",
    },
  }[activeModule] ?? {
    title: "AI Security Platform",
    subtitle: "AI-powered cybersecurity operations",
    statusLabel: "AI Online",
  };

  return (
    <header className="h-20 bg-cyber-surface border-b border-cyber-border px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-cyber-heading tracking-tight">
            {moduleConfig.title}
          </h1>
          {/* AI Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">{moduleConfig.statusLabel}</span>
          </div>
        </div>
        <p className="text-xs text-cyber-muted mt-0.5">{moduleConfig.subtitle}</p>
      </div>

      {/* Right Tools & Instructor Mode */}
      <div className="flex items-center gap-4">
        {/* Instructor Mode Toggle */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen
              className={`w-4 h-4 ${
                instructorMode ? "text-cyan-400" : "text-slate-500"
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-cyber-text leading-none">
                Instructor Mode
              </span>
              <span className="text-[11px] text-cyber-muted leading-tight font-mono mt-0.5">
                Teaching Points Overlay
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleInstructorMode(!instructorMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              instructorMode ? "bg-cyan-600" : "bg-slate-800"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                instructorMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
