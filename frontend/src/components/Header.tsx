"use client";

import React from "react";
import { FontSizeControls } from "./FontSizeControls";
import { BookOpen, Moon, Sun, Keyboard, Search } from "lucide-react";
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
  onToggleShortcuts?: () => void;
  onToggleCommand?: () => void;
}

export function Header({
  instructorMode,
  onToggleInstructorMode,
  aiStatus,
  activeModule = "soc-analyst",
  theme = "dark",
  onToggleTheme,
  onToggleShortcuts,
  onToggleCommand,
}: HeaderProps) {
  const { toggleBrief, openBrief, startedLabs, missionSteps, openLabId } = useLabBrief();
  const brief = getLabBrief(activeModule);
  const isStarted = brief ? startedLabs.has(brief.id) : false;
  const currentStep = brief ? (missionSteps[brief.id] ?? -1) : -1;
  const briefOpen = brief ? openLabId === brief.id : false;

  const titles: Record<string, [string, string]> = {
    "learning-hub": ["Learning Hub", "Hands-on AI security practice"],
    "soc-analyst": ["Security log analysis", "Choose a sample, run the analysis, and review the evidence."],
    "threat-hunting": ["Threat hunting", "Build a hypothesis and find evidence in security logs."],
    "pentest-assistant": ["Security assessment", "Plan tests and review findings for a simulated target."],
    "prompt-injection": ["Prompt injection", "Test hidden instructions against an AI application's controls."],
    "jailbreak-lab": ["Model safety", "Test how a simulated model handles unsafe requests."],
    "adversarial-ml": ["Adversarial machine learning", "Change an image and compare model predictions."],
    "agent-security": ["Agent security", "Test tool access, memory, and permission boundaries."],
    "malware-analysis": ["Malware analysis", "Review sample behavior and write detection rules."],
    "code-review": ["Security code review", "Find weak code, inspect a fix, and verify it."],
    "privacy-lab": ["Data privacy", "Find sensitive data and remove it before sharing."],
    "governance": ["AI risk and governance", "Assess risk, apply controls, and decide whether to launch."],
    "ai-failure-lab": ["AI reliability", "Check AI claims against evidence and make your own decision."],
  };
  const [title, subtitle] = titles[activeModule] ?? titles["learning-hub"];
  return (
    <header className="workspace-header">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h2 className="text-base font-semibold tracking-tight text-cyber-heading">{title}</h2>
          {activeModule !== "learning-hub" && <span className="header-status" role="status">{aiStatus === "processing" ? "Analysis running" : aiStatus === "offline" ? "Local simulation" : "Simulation ready"}</span>}
        </div>
        <p className="header-subtitle mt-1 text-xs text-cyber-muted">{subtitle}</p>
        {brief && isStarted && <LabMission brief={brief} currentStep={currentStep} onViewBrief={() => openBrief(brief.id)} className="mt-1.5" />}
      </div>
      <div className="header-tools">
        {brief && <LabBriefButton labId={brief.id} open={briefOpen} onToggle={() => toggleBrief(brief.id)} />}
        {onToggleCommand && <button className="tool-button" onClick={onToggleCommand} title="Find a lab (Ctrl or Command + K)" aria-label="Open command palette"><Search size={16} strokeWidth={1.75} /></button>}
        {onToggleShortcuts && <button className="tool-button hidden sm:grid" onClick={onToggleShortcuts} title="Keyboard shortcuts" aria-label="Open keyboard shortcuts help"><Keyboard size={16} strokeWidth={1.75} /></button>}
        <FontSizeControls />
        <button className="tool-button" onClick={onToggleTheme} title={theme === "light" ? "Use dark mode" : "Use light mode"} aria-label="Toggle theme">{theme === "light" ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}</button>
        {brief && <button onClick={() => onToggleInstructorMode(!instructorMode)} role="switch" aria-checked={instructorMode} aria-label="Toggle teaching notes" className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${instructorMode ? "border-cyber-border-light bg-cyber-surface text-cyber-heading" : "border-transparent text-cyber-muted"}`}><BookOpen size={16} strokeWidth={1.75} /><span>Teaching notes</span><span className="hidden sm:inline">{instructorMode ? "On" : "Off"}</span></button>}
      </div>
    </header>
  );
}
