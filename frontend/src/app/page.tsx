"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { LogInvestigationPanel } from "@/components/LogInvestigationPanel";
import { LiveInvestigationView } from "@/components/LiveInvestigationView";
import { ThreatIntelPanel } from "@/components/ThreatIntelPanel";
import { IncidentReportView } from "@/components/IncidentReportView";
import { TeachingOverlay } from "@/components/TeachingOverlay";

import { ThreatHuntingConsole } from "@/components/threat-hunting/ThreatHuntingConsole";
import { AIHuntingTimeline } from "@/components/threat-hunting/AIHuntingTimeline";
import { TelemetryExplorer } from "@/components/threat-hunting/TelemetryExplorer";
import { QueryGenerator } from "@/components/threat-hunting/QueryGenerator";
import { ThreatFindings } from "@/components/threat-hunting/ThreatFindings";
import { ThreatHuntingReportView } from "@/components/threat-hunting/ThreatHuntingReportView";

import { EngagementSetup } from "@/components/pentest/EngagementSetup";
import { AttackSurfaceMap } from "@/components/pentest/AttackSurfaceMap";
import { PentestStrategyTimeline } from "@/components/pentest/PentestStrategyTimeline";
import { VulnerabilityAnalysis } from "@/components/pentest/VulnerabilityAnalysis";
import { SecurityTestingAssistant } from "@/components/pentest/SecurityTestingAssistant";
import { PentestReportView } from "@/components/pentest/PentestReportView";

import { PromptInjectionLab } from "@/components/llm-lab/PromptInjectionLab";

import { JailbreakLab } from "@/components/jailbreak/JailbreakLab";

import { AdversarialLab } from "@/components/adversarial/AdversarialLab";

import { AgentSecurityLab } from "@/components/agent-security/AgentSecurityLab";

import { MalwareAnalystLab } from "@/components/malware/MalwareAnalystLab";

import { CodeReviewLab } from "@/components/code-review/CodeReviewLab";

import { PrivacyLab } from "@/components/privacy/PrivacyLab";

import { GovernanceLab } from "@/components/governance/GovernanceLab";

import { LearningHub } from "@/components/learning-hub/LearningHub";
import type { LearningPathId } from "@/services/learningHub";
import {
  getProgress,
  getLearningPath,
  getCompletedLabIds,
  setLearningPath,
  setLabCompleted,
  clearAllProgress,
  type ProgressSummary,
} from "@/services/learningHub";

import {
  fetchDatasetContent,
  analyzeLogs,
  AIAnalysisResult,
  ReasoningStage,
} from "@/services/aiAnalyst";

import {
  runThreatHunt,
  ThreatHuntResult,
  HuntingStep,
} from "@/services/threatHunter";

import {
  runPentestAssessment,
  askPentestAssistant,
  PentestTargetConfig,
  PentestResult,
  PentestPhase,
  AssistantAnswer,
} from "@/services/pentestAssistant";

export default function SOCAnalystPage() {
  const [activeModule, setActiveModule] = useState<"learning-hub" | "soc-analyst" | "threat-hunting" | "pentest-assistant" | "prompt-injection" | "jailbreak-lab" | "adversarial-ml" | "agent-security" | "malware-analysis" | "code-review" | "privacy-lab" | "governance">("learning-hub");
  const [instructorMode, setInstructorMode] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hubVersion, setHubVersion] = useState(0);
  // SSR-safe: never read localStorage during the first render (it would
  // mismatch the server-rendered HTML). Read it once after mount instead.
  const [hubProgress, setHubProgress] = useState<ProgressSummary>({
    total: 11,
    completed: 0,
    percent: 0,
  });
  const [hubPath, setHubPath] = useState<LearningPathId | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Module 1 State: AI SOC Analyst
  const [logContent, setLogContent] = useState("");
  const [selectedDatasetKey, setSelectedDatasetKey] = useState("bruteforce");
  const [selectedDatasetName, setSelectedDatasetName] = useState("SSH Brute Force Attack");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // Module 2 State: AI Threat Hunting Assistant
  const [isHunting, setIsHunting] = useState(false);
  const [currentHuntingStepIndex, setCurrentHuntingStepIndex] = useState(0);
  const [huntResult, setHuntResult] = useState<ThreatHuntResult | null>(null);

  // Module 3 State: AI Pentest Assistant
  const [isAssessing, setIsAssessing] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [pentestResult, setPentestResult] = useState<PentestResult | null>(null);
  const [assistantAnswer, setAssistantAnswer] = useState<AssistantAnswer | null>(null);

  useEffect(() => {
    loadDataset("bruteforce");
    // Run an initial threat hunt demo on startup
    handleLaunchThreatHunt("Detect obfuscated PowerShell script execution and credential dumping attempts");
  }, []);

  // Apply persisted theme on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("playground.theme") : null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  // Hydrate learning-hub progress + path after mount (localStorage is client-only)
  useEffect(() => {
    setHubProgress(getProgress());
    setHubPath(getLearningPath());
    setCompletedIds(getCompletedLabIds());
  }, [hubVersion, activeModule]);

  // Reflect theme on the <html> element (drives CSS variables)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") localStorage.setItem("playground.theme", theme);
  }, [theme]);

  const handleToggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const loadDataset = async (key: string) => {
    setSelectedDatasetKey(key);
    const content = await fetchDatasetContent(key);
    setLogContent(content);

    if (key === "bruteforce") {
      setSelectedDatasetName("SSH Brute Force Attack");
    } else if (key === "powershell_attack") {
      setSelectedDatasetName("Suspicious PowerShell");
    } else {
      setSelectedDatasetName("Malware Execution");
    }
  };

  const handleStartAnalysis = async () => {
    if (!logContent.trim()) return;

    setIsAnalyzing(true);
    setCurrentStageIndex(0);

    const result = await analyzeLogs(logContent, selectedDatasetName);

    for (let i = 0; i < result.reasoning_stages.length; i++) {
      setCurrentStageIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleLaunchThreatHunt = async (query: string) => {
    setIsHunting(true);
    setCurrentHuntingStepIndex(0);

    const result = await runThreatHunt(query);

    for (let i = 0; i < result.timeline.length; i++) {
      setCurrentHuntingStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    setHuntResult(result);
    setIsHunting(false);
  };

  const handleStartAssessment = async (config: PentestTargetConfig) => {
    setIsAssessing(true);
    setCurrentPhaseIndex(0);
    setPentestResult(null);
    setAssistantAnswer(null);

    const result = await runPentestAssessment(config);

    for (let i = 0; i < result.phases.length; i++) {
      setCurrentPhaseIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    setPentestResult(result);
    setIsAssessing(false);
  };

  const handleAskAssistant = async (question: string) => {
    const answer = await askPentestAssistant(question, pentestResult);
    setAssistantAnswer(answer);
  };

  // Module 0: Learning Hub handlers
  const handleSelectLab = (labId: string) => {
    setLabCompleted(labId, true);
    setActiveModule(labId as any);
  };

  const handleChoosePath = (path: LearningPathId) => {
    setLearningPath(path);
    setHubPath(path);
    // Re-render to reflect the new suggested labs
    setActiveModule("learning-hub" as any);
  };

  const handleResetProgress = () => {
    clearAllProgress();
    setHubVersion((v) => v + 1);
    setActiveModule("learning-hub" as any);
  };

  const openTheoryModule = (topicId: string) => {
    const topicToLab: Record<string, string> = {
      ai: "threat-hunting",
      ml: "adversarial-ml",
      llm: "prompt-injection",
      rag: "prompt-injection",
      prompt: "prompt-injection",
      adversarial: "adversarial-ml",
      agent: "jailbreak-lab",
    };
    setActiveModule((topicToLab[topicId] ?? "soc-analyst") as any);
  };

  const initialSOCStages: ReasoningStage[] = [
    { stage: 1, title: "Receiving & Normalizing Logs", status: "pending", detail: "Ready to parse and structure log stream", timestamp: "--" },
    { stage: 2, title: "Extracting Indicators of Compromise (IOCs)", status: "pending", detail: "Extracting IP addresses, users, commands, domains", timestamp: "--" },
    { stage: 3, title: "Analyzing Behavioral Anomalies", status: "pending", detail: "Detecting authentication bursts & malicious script execution", timestamp: "--" },
    { stage: 4, title: "Mapping MITRE ATT&CK Matrix", status: "pending", detail: "Correlating event telemetry against MITRE techniques", timestamp: "--" },
    { stage: 5, title: "Synthesizing SOC Incident Report", status: "pending", detail: "Generating formal triage report & containment playbook", timestamp: "--" },
  ];

  const initialHuntingTimeline: HuntingStep[] = [
    { step: 1, name: "Understanding Objective", detail: "Ready to process natural language threat hunting query", timestamp: "--" },
    { step: 2, name: "Creating Hypothesis", detail: "Formulating adversary TTP hypothesis", timestamp: "--" },
    { step: 3, name: "Selecting Telemetry", detail: "Identifying relevant Windows, Network, & DNS logs", timestamp: "--" },
    { step: 4, name: "Generating Queries", detail: "Synthesizing Sigma, KQL, & Splunk queries", timestamp: "--" },
    { step: 5, name: "Analyzing Results", detail: "Extracting verified threat findings", timestamp: "--" },
  ];

  const initialPentestPhases: PentestPhase[] = [
    { phase: 1, name: "Information Gathering", detail: "Ready to map target attack surface and enumerate exposed components", timestamp: "--" },
    { phase: 2, name: "Authentication Testing", detail: "Ready to assess credential & session handling", timestamp: "--" },
    { phase: 3, name: "Input Validation Testing", detail: "Ready to probe injection and validation flaws", timestamp: "--" },
    { phase: 4, name: "Authorization Testing", detail: "Ready to test object-level access controls", timestamp: "--" },
    { phase: 5, name: "Reporting", detail: "Ready to synthesize professional pentest report", timestamp: "--" },
  ];

  return (
    <div className="flex h-screen bg-cyber-base overflow-hidden">
      {/* Left Sidebar Navigation */}
      <Navigation
        activeModule={activeModule}
        onSelectModule={(modId) => setActiveModule(modId as any)}
        collapsed={!sidebarOpen}
        onToggleCollapsed={() => setSidebarOpen((v) => !v)}
      />

      {/* Main Command Center Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Command Center Header */}
        <Header
          instructorMode={instructorMode}
          onToggleInstructorMode={setInstructorMode}
          aiStatus={isAnalyzing || isHunting || isAssessing || aiBusy ? "processing" : "online"}
          activeModule={activeModule}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-6 space-y-6">
          {/* Module 0: Learning Hub / Home */}
          {activeModule === "learning-hub" && (
            <LearningHub
              key={hubVersion}
              progress={hubProgress}
              completedIds={completedIds}
              learningPath={hubPath}
              onSelectLab={handleSelectLab}
              onOpenTheory={openTheoryModule}
              onChoosePath={handleChoosePath}
              onExploreLabs={() => handleSelectLab("soc-analyst")}
              onResetProgress={handleResetProgress}
            />
          )}

          {/* Module 1: AI SOC Analyst View */}
          {activeModule === "soc-analyst" && (
            <>
              {instructorMode && analysisResult?.instructor_teaching_points && (
                <TeachingOverlay
                  teachingPoints={analysisResult.instructor_teaching_points}
                  onClose={() => setInstructorMode(false)}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
                <div className="lg:col-span-4 h-full">
                  <LogInvestigationPanel
                    logContent={logContent}
                    onLogContentChange={setLogContent}
                    onSelectDataset={loadDataset}
                    onStartAnalysis={handleStartAnalysis}
                    isAnalyzing={isAnalyzing}
                    selectedDatasetName={selectedDatasetName}
                  />
                </div>

                <div className="lg:col-span-4 h-full">
                  <LiveInvestigationView
                    stages={analysisResult?.reasoning_stages || initialSOCStages}
                    currentStageIndex={currentStageIndex}
                    isAnalyzing={isAnalyzing}
                  />
                </div>

                <div className="lg:col-span-4 h-full">
                  <ThreatIntelPanel
                    severity={analysisResult?.severity || "HIGH"}
                    iocs={
                      analysisResult?.iocs || {
                        ips: ["45.33.32.156"],
                        domains: ["malicious-c2.top"],
                        users: ["rdevon"],
                        hosts: ["auth-gateway.internal.corp"],
                        commands: ["/usr/bin/cat /etc/shadow"],
                      }
                    }
                    mitreMappings={
                      analysisResult?.mitre_mappings || [
                        {
                          id: "T1110",
                          name: "Brute Force",
                          tactic: "Credential Access",
                          description: "Authentication burst failure followed by privilege escalation.",
                          confidence: "96%",
                        },
                      ]
                    }
                  />
                </div>
              </div>

              {analysisResult && (
                <div className="pt-2">
                  <IncidentReportView report={analysisResult.report} />
                </div>
              )}
            </>
          )}

          {/* Module 2: AI Threat Hunting Assistant View */}
          {activeModule === "threat-hunting" && (
            <>
              {instructorMode && huntResult?.instructor_teaching_points && (
                <TeachingOverlay
                  teachingPoints={huntResult.instructor_teaching_points}
                  onClose={() => setInstructorMode(false)}
                />
              )}

              {/* Section 1: Threat Hunting Console */}
              <ThreatHuntingConsole
                onSearch={handleLaunchThreatHunt}
                isHunting={isHunting}
              />

              {/* 3-Column Grid for Workflow, Telemetry, and Query Generation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
                {/* Section 2: AI Hunting Timeline (4 Cols) */}
                <div className="lg:col-span-4 h-full">
                  <AIHuntingTimeline
                    timeline={huntResult?.timeline || initialHuntingTimeline}
                    currentStepIndex={currentHuntingStepIndex}
                    isHunting={isHunting}
                  />
                </div>

                {/* Section 3: Telemetry Explorer (4 Cols) */}
                <div className="lg:col-span-4 h-full">
                  <TelemetryExplorer
                    sources={
                      huntResult?.telemetry_sources || [
                        { name: "Windows Events (EVTX)", status: "Connected", active: true, count: "1,420 events/sec" },
                        { name: "Network Traffic (Zeek/Suricata)", status: "Connected", active: true, count: "8,950 packets/sec" },
                        { name: "DNS Query Logs", status: "Connected", active: true, count: "3,100 queries/sec" },
                        { name: "Cloud Audit Logs (AWS/Azure)", status: "Available", active: false, count: "Standby" },
                      ]
                    }
                    isHunting={isHunting}
                  />
                </div>

                {/* Section 4: Detection Query Generator (4 Cols) */}
                <div className="lg:col-span-4 h-full">
                  <QueryGenerator
                    queries={
                      huntResult?.queries || {
                        sigma: "title: Suspicious PowerShell Execution\nlogsource:\n    category: process_creation",
                        kql: "DeviceProcessEvents\n| where ProcessCommandLine contains \"powershell\"",
                        splunk: "index=windows EventCode=4688 Image=\"*powershell.exe\"",
                        sql: "SELECT * FROM process_events WHERE command_line LIKE '%powershell%';"
                      }
                    }
                  />
                </div>
              </div>

              {/* Section 5: Threat Findings */}
              {huntResult && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-12">
                    <ThreatFindings
                      findings={huntResult.findings}
                      qualityScore={huntResult.quality_score}
                      confidence={huntResult.confidence}
                    />
                  </div>
                </div>
              )}

              {/* Section 6: Threat Hunting Report */}
              {huntResult && (
                <div className="pt-2">
                  <ThreatHuntingReportView
                    report={huntResult.report}
                    qualityScore={huntResult.quality_score}
                  />
                </div>
              )}
            </>
          )}

          {/* Module 3: AI Pentest Assistant View */}
          {activeModule === "pentest-assistant" && (
            <>
              {instructorMode && pentestResult?.instructor_teaching_points && (
                <TeachingOverlay
                  teachingPoints={pentestResult.instructor_teaching_points}
                  onClose={() => setInstructorMode(false)}
                />
              )}

              {/* Section 1: Engagement Setup */}
              <EngagementSetup
                onStartAssessment={handleStartAssessment}
                isAssessing={isAssessing}
              />

              {/* 3-Column Grid: Attack Surface, Strategy, Assistant */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
                {/* Section 2: AI Attack Surface Map (4 Cols) */}
                <div className="lg:col-span-4 h-full">
                  <AttackSurfaceMap
                    components={
                      pentestResult?.attack_surface || [
                        { id: "server", name: "Web Server", description: "Public-facing entry point", risks: ["Outdated software", "Verbose errors", "Missing headers"], icon: "server" },
                        { id: "auth", name: "Authentication", description: "Identity & session layer", risks: ["Weak session handling", "No rate limiting"], icon: "auth" },
                        { id: "database", name: "Database", description: "Data storage layer", risks: ["Injection risk", "Exposed ports"], icon: "database" },
                        { id: "api", name: "API", description: "Programmatic interface", risks: ["Missing authorization", "Excessive exposure"], icon: "api" },
                      ]
                    }
                    isAssessing={isAssessing}
                  />
                </div>

                {/* Section 3: AI Testing Strategy (4 Cols) */}
                <div className="lg:col-span-4 h-full">
                  <PentestStrategyTimeline
                    phases={pentestResult?.phases || initialPentestPhases}
                    currentPhaseIndex={currentPhaseIndex}
                    isAssessing={isAssessing}
                  />
                </div>

                {/* Section 5: Security Testing Assistant (4 Cols) */}
                <div className="lg:col-span-4 h-full">
                  <SecurityTestingAssistant
                    onAsk={handleAskAssistant}
                    isAssessing={isAssessing}
                    answer={assistantAnswer}
                  />
                </div>
              </div>

              {/* Section 4: Vulnerability Analysis */}
              {pentestResult && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-12">
                    <VulnerabilityAnalysis
                      findings={pentestResult.findings}
                      riskLevel={pentestResult.risk_level}
                      isAssessing={isAssessing}
                    />
                  </div>
                </div>
              )}

              {/* Section 6: Professional Pentest Report */}
              {pentestResult && (
                <div className="pt-2">
                  <PentestReportView report={pentestResult.report} />
                </div>
              )}
            </>
          )}

          {/* Module 4: Prompt Injection Lab View */}
          {activeModule === "prompt-injection" && (
            <PromptInjectionLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 5: Jailbreak Playground View */}
          {activeModule === "jailbreak-lab" && (
            <JailbreakLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 6: Adversarial ML Lab View */}
          {activeModule === "adversarial-ml" && (
            <AdversarialLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 7: AI Agent Security Lab View */}
          {activeModule === "agent-security" && (
            <AgentSecurityLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 8: AI Malware Analyst Lab View */}
          {activeModule === "malware-analysis" && (
            <MalwareAnalystLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}
          {/* Module 9: AI Security Code Reviewer Lab View */}
          {activeModule === "code-review" && (
            <CodeReviewLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 10: AI Data Privacy Lab View */}
          {activeModule === "privacy-lab" && (
            <PrivacyLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 11: AI Risk Assessment & Governance Lab View */}
          {activeModule === "governance" && (
            <GovernanceLab
              instructorMode={instructorMode}
              onToggleInstructorMode={setInstructorMode}
              onStatusChange={setAiBusy}
            />
          )}
        </main>
      </div>
    </div>
  );
}
