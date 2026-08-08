"use client";

import React from "react";
import { BookOpen, Moon, Sun } from "lucide-react";
import { getLabBrief } from "@/data/labBriefData";
import { useLabBrief } from "@/components/lab-brief/LabBriefContext";
import { LabBriefButton } from "@/components/lab-brief/LabBriefButton";
import { LabMission } from "@/components/lab-brief/LabMission";

interface HeaderProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  aiStatus: "online" | "processing" | "offline";
  activeModule?: string;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export function Header({
  instructorMode,
  onToggleInstructorMode,
  aiStatus,
  activeModule = "soc-analyst",
  theme = "dark",
  onToggleTheme,
}: HeaderProps) {
  const { toggleBrief, openBrief, startedLabs, missionSteps, openLabId } = useLabBrief();
  const brief = getLabBrief(activeModule);
  const isStarted = brief ? startedLabs.has(brief.id) : false;
  const currentStep = brief ? (missionSteps[brief.id] ?? -1) : -1;
  const briefOpen = brief ? openLabId === brief.id : false;

  const moduleConfig = {
    "learning-hub": {
      title: "Learning Hub",
      subtitle: "Understand AI for cybersecurity and the cybersecurity of AI",
      statusLabel: "Ready to learn",
    },
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
    "malware-analysis": {
      title: "AI Malware Analyst Lab",
      subtitle: "Analyze simulated malware, map behaviors, and draft detections",
      statusLabel: aiStatus === "processing" ? "Malware Analyst Processing..." : "Malware Analysis Online",
    },
    "code-review": {
      title: "AI Security Code Reviewer",
      subtitle: "Review code for vulnerabilities, inspect fixes, and verify before deploy",
      statusLabel: aiStatus === "processing" ? "Secure Code Analysis Running..." : "Secure Code Analysis Ready",
    },
    "privacy-lab": {
      title: "AI Data Privacy Lab",
      subtitle: "Detect sensitive data, enforce policy, redact, and send safe prompts",
      statusLabel: aiStatus === "processing" ? "Privacy Scan Running..." : "Privacy Protection Active",
    },
    "ai-failure-lab": {
      title: "AI Failure Lab",
      subtitle: "Validate AI output, judge AI decisions, and prove AI output is not automatically correct",
      statusLabel: aiStatus === "processing" ? "Reliability Engine Processing..." : "Reliability Validation Ready",
    },
    governance: {
      title: "AI Risk & Governance Simulator",
      subtitle: "Assess AI risks, apply controls, and decide whether a system may deploy",
      statusLabel: aiStatus === "processing" ? "Governance Review Running..." : "Risk Assessment Ready",
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
        <div className="flex items-center gap-3 holo-scan">
          <h1 className="text-xl font-bold text-cyber-heading tracking-tight">
            {moduleConfig.title}
          </h1>
          {/* AI Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-colors ${
              aiStatus === "processing"
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
                : "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {aiStatus === "processing" ? (
              <span className="live-dot" aria-hidden="true" />
            ) : (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
            <span className="font-semibold">{moduleConfig.statusLabel}</span>
          </div>
        </div>
        <p className="text-xs text-cyber-muted mt-0.5">{moduleConfig.subtitle}</p>
        {brief && isStarted && (
          <LabMission
            brief={brief}
            currentStep={currentStep}
            onViewBrief={() => openBrief(brief.id)}
            className="mt-1.5"
          />
        )}
      </div>

      {/* Right Tools & Instructor Mode */}
      <div className="flex items-center gap-4">
        {/* Lab Brief */}
        {brief && (
          <LabBriefButton
            labId={brief.id}
            open={briefOpen}
            onToggle={() => toggleBrief(brief.id)}
          />
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-label="Toggle theme"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-cyber-border bg-cyber-surface text-cyber-muted transition-colors hover:text-accent"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {/* Instructor Mode Toggle */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-cyber-surface-hover border border-cyber-border">
          <div className="flex items-center gap-2">
            <BookOpen
              className={`w-4 h-4 ${
                instructorMode ? "text-accent" : "text-cyber-muted"
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-cyber-heading leading-none">
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
              instructorMode ? "bg-accent" : "bg-cyber-border-light"
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
