"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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

import { AiFailureLab } from "@/components/ai-failures/AiFailureLab";

import { LabBriefProvider, useLabBrief } from "@/components/lab-brief/LabBriefContext";
import { LabBriefDrawer } from "@/components/lab-brief/LabBriefDrawer";
import { LabCompletion } from "@/components/lab-brief/LabCompletion";
import { getLabBrief } from "@/data/labBriefData";
import { CursorHalo } from "@/components/effects/CursorHalo";
import { Reveal } from "@/components/effects/Reveal";

import { LearningHub } from "@/components/learning-hub/LearningHub";
import type { LearningPathId } from "@/services/learningHub";
import {
  getProgress,
  getLearningPath,
  getCompletedLabIds,
  setLearningPath,
  clearAllProgress,
  LABS,
  type ProgressSummary,
} from "@/services/learningHub";

import {
  fetchDatasetContent,
  analyzeLogs,
  fetchDatasets,
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
  return (
    <LabBriefProvider>
      <SOCAnalystApp />
    </LabBriefProvider>
  );
}

function SOCAnalystApp() {
  const { markStarted, markCompleted, setMissionStep, resetLab, completedLabs, closeBrief } = useLabBrief();

  const MODULE_IDS = [
    "learning-hub", "soc-analyst", "threat-hunting", "pentest-assistant",
    "prompt-injection", "jailbreak-lab", "adversarial-ml", "agent-security",
    "malware-analysis", "code-review", "privacy-lab", "governance", "ai-failure-lab",
  ] as const;
  type ModuleId = (typeof MODULE_IDS)[number];
  const DEFAULT_MODULE: ModuleId = "learning-hub";

  const moduleFromHash = (hash: string): ModuleId => {
    const m = hash.replace(/^#\/?/, "");
    return (MODULE_IDS as readonly string[]).includes(m) ? (m as ModuleId) : DEFAULT_MODULE;
  };

  const [activeModule, setActiveModule] = useState<ModuleId>(DEFAULT_MODULE);

  /* Restore the active module from the URL hash on first load (deep links). */
  useEffect(() => {
    setActiveModule(moduleFromHash(window.location.hash));
  }, []);

  /* Push a real history entry whenever the module changes, so the browser
     back/forward buttons walk back through the modules instead of exiting
     the app entirely. */
  const navigate = useCallback((next: ModuleId) => {
    setActiveModule(next);
    if (typeof window === "undefined") return;
    const target = `#/${next}`;
    if (window.location.hash !== target) {
      window.history.pushState({ module: next }, "", target);
    }
  }, []);

  /* Back / forward: restore the module from whatever hash the browser moved to. */
  useEffect(() => {
    const onPopState = () => setActiveModule(moduleFromHash(window.location.hash));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  /* Any module navigation invalidates in-flight run flows. */
  useEffect(() => {
    runTokenRef.current += 1;
  }, [activeModule]);

  useEffect(() => {
    closeBrief();
  }, [activeModule, closeBrief]);

  const [instructorMode, setInstructorMode] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hubVersion, setHubVersion] = useState(0);
  // SSR-safe: never read localStorage during the first render (it would
  // mismatch the server-rendered HTML). Read it once after mount instead.
  const [hubProgress, setHubProgress] = useState<ProgressSummary>({
    total: LABS.length,
    completed: 0,
    percent: 0,
  });
  const [hubPath, setHubPath] = useState<LearningPathId | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

// Invalidated whenever the user navigates, so staged run flows in a
// previous module can't keep firing state updates into a stale view.
const runTokenRef = useRef(0);

  // Module 1 State: AI SOC Analyst
  const [logContent, setLogContent] = useState("");
  const [selectedDatasetName, setSelectedDatasetName] = useState("SSH Brute Force Attack");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [sampleDatasets, setSampleDatasets] = useState<
    { key: string; label: string; desc: string }[]
  >([
    { key: "bruteforce", label: "Load Brute Force Attack", desc: "SSH authentication surge & escalation" },
    { key: "powershell_attack", label: "Load Suspicious PowerShell", desc: "Obfuscated scriptblock & Mimikatz dump" },
    { key: "malware_execution", label: "Load Malware Execution", desc: "Process injection, registry & C2 beacon" },
  ]);

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
    fetchDatasets().then((list) => {
      const datasets = Array.isArray(list) ? list : [];
      if (datasets.length > 0) {
        setSampleDatasets(
          datasets.map((d) => ({
            key: d.key ?? d.filename?.replace(/\.json$/, ""),
            label: d.name ? `Load ${d.name}` : "Load Sample Dataset",
            desc: d.source ? `${d.source} · ${d.entry_count} events` : `${d.entry_count} events`,
          }))
        );
      }
    });
  }, []);

  // Apply persisted theme on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("playground.theme") : null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  // Probe the FastAPI backend so the UI can surface offline fallback mode
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${base}/api/health`)
      .then((res) => setBackendOnline(res.ok))
      .catch(() => setBackendOnline(false));
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
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    markStarted("soc-analyst");
    setIsAnalyzing(true);
    setCurrentStageIndex(0);

    const result = await analyzeLogs(logContent, selectedDatasetName);

    for (let i = 0; i < result.reasoning_stages.length; i++) {
      if (runTokenRef.current !== token) return;
      setCurrentStageIndex(i);
      setMissionStep("soc-analyst", i);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
    if (runTokenRef.current !== token) return;

    setAnalysisResult(result);
    markCompleted("soc-analyst");
    setIsAnalyzing(false);
    setMissionStep("soc-analyst", -1);
  };

  const handleLaunchThreatHunt = async (query: string) => {
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    setIsHunting(true);
    setCurrentHuntingStepIndex(0);

    markStarted("threat-hunting");
    const result = await runThreatHunt(query);

    for (let i = 0; i < result.timeline.length; i++) {
      if (runTokenRef.current !== token) return;
      setCurrentHuntingStepIndex(i);
      setMissionStep("threat-hunting", i);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    if (runTokenRef.current !== token) return;

    setHuntResult(result);
    markCompleted("threat-hunting");
    setIsHunting(false);
  };

  const handleStartAssessment = async (config: PentestTargetConfig) => {
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    setIsAssessing(true);
    setCurrentPhaseIndex(0);
    setPentestResult(null);
    setAssistantAnswer(null);

    markStarted("pentest-assistant");
    const result = await runPentestAssessment(config);

    for (let i = 0; i < result.phases.length; i++) {
      if (runTokenRef.current !== token) return;
      setCurrentPhaseIndex(i);
      setMissionStep("pentest-assistant", i);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    if (runTokenRef.current !== token) return;

    setPentestResult(result);
    markCompleted("pentest-assistant");
    setIsAssessing(false);
  };

  const handleAskAssistant = async (question: string) => {
    const answer = await askPentestAssistant(question, pentestResult);
    setAssistantAnswer(answer);
  };

  // Module 0: Learning Hub handlers
  const handleSelectLab = (labId: string) => {
    navigate(labId as ModuleId);
  };

  const handleChoosePath = (path: LearningPathId) => {
    setLearningPath(path);
    setHubPath(path);
    // Re-render to reflect the new suggested labs
    navigate("learning-hub");
  };

  const handleResetProgress = () => {
    clearAllProgress();
    setHubVersion((v) => v + 1);
    navigate("learning-hub");
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
      hunting: "threat-hunting",
      detection: "threat-hunting",
      pentest: "pentest-assistant",
    };
    navigate((topicToLab[topicId] ?? "soc-analyst") as ModuleId);
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

  const nextLabId = useMemo(() => {
    const order = LABS.map((l) => l.id);
    const idx = order.indexOf(activeModule as string);
    if (idx < 0) return null;
    return order[idx + 1] ?? null;
  }, [activeModule]);

  const handleNextLab = () => {
    if (!nextLabId) return;
    navigate(nextLabId as ModuleId);
  };

  return (
    <div className="flex h-screen bg-cyber-base overflow-hidden">
      {/* Animated lab backdrop (grid + drifting particles) */}
      <div className="cyber-backdrop" aria-hidden="true">
        <div className="cyber-backdrop-grid" />
        <div className="cyber-backdrop-particles" />
      </div>

      {/* Cursor-following holographic halo */}
      <CursorHalo />

      {/* Left Sidebar Navigation */}
      <Navigation
        activeModule={activeModule}
        onSelectModule={(modId) => navigate(modId as ModuleId)}
        collapsed={!sidebarOpen}
        onToggleCollapsed={() => setSidebarOpen((v) => !v)}
      />

      {/* Main Command Center Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        {/* Command Center Header */}
        <Header
          instructorMode={instructorMode}
          onToggleInstructorMode={setInstructorMode}
          aiStatus={isAnalyzing || isHunting || isAssessing || aiBusy ? "processing" : backendOnline ? "online" : "offline"}
          activeModule={activeModule}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Content Body */}
        <main className="mx-auto flex-1 w-full max-w-[1600px] p-4 sm:p-6 space-y-6">
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

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[420px] xl:min-h-[580px]">
                <div className="xl:col-span-4 h-full">
                  <LogInvestigationPanel
                    logContent={logContent}
                    onLogContentChange={setLogContent}
                    onSelectDataset={loadDataset}
                    onStartAnalysis={handleStartAnalysis}
                    isAnalyzing={isAnalyzing}
                    selectedDatasetName={selectedDatasetName}
                    sampleDatasets={sampleDatasets}
                  />
                </div>

                <div className="xl:col-span-4 h-full">
                  <LiveInvestigationView
                    stages={analysisResult?.reasoning_stages || initialSOCStages}
                    currentStageIndex={currentStageIndex}
                    isAnalyzing={isAnalyzing}
                  />
                </div>

                <div className="xl:col-span-4 h-full">
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
                <Reveal delay={120}>
                  <div className="pt-2">
                    <IncidentReportView
                      report={analysisResult.report}
                      onOpenTheory={openTheoryModule}
                    />
                  </div>
                </Reveal>
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
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[420px] xl:min-h-[520px]">
                {/* Section 2: AI Hunting Timeline (4 Cols) */}
                <div className="xl:col-span-4 h-full">
                  <AIHuntingTimeline
                    timeline={huntResult?.timeline || initialHuntingTimeline}
                    currentStepIndex={currentHuntingStepIndex}
                    isHunting={isHunting}
                  />
                </div>

                {/* Section 3: Telemetry Explorer (4 Cols) */}
                <div className="xl:col-span-4 h-full">
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
                <div className="xl:col-span-4 h-full">
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
                <div className="grid grid-cols-1 gap-6">
                  <div className="w-full">
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
                <Reveal delay={120}>
                  <div className="pt-2">
                    <ThreatHuntingReportView
                      report={huntResult.report}
                      qualityScore={huntResult.quality_score}
                      onOpenTheory={openTheoryModule}
                    />
                  </div>
                </Reveal>
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
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[420px] xl:min-h-[520px]">
                {/* Section 2: AI Attack Surface Map (4 Cols) */}
                <div className="xl:col-span-4 h-full">
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
                <div className="xl:col-span-4 h-full">
                  <PentestStrategyTimeline
                    phases={pentestResult?.phases || initialPentestPhases}
                    currentPhaseIndex={currentPhaseIndex}
                    isAssessing={isAssessing}
                  />
                </div>

                {/* Section 5: Security Testing Assistant (4 Cols) */}
                <div className="xl:col-span-4 h-full">
                  <SecurityTestingAssistant
                    onAsk={handleAskAssistant}
                    isAssessing={isAssessing}
                    answer={assistantAnswer}
                  />
                </div>
              </div>

              {/* Section 4: Vulnerability Analysis */}
              {pentestResult && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="w-full">
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
                <Reveal delay={120}>
                  <div className="pt-2">
                    <PentestReportView
                      report={pentestResult.report}
                      onOpenTheory={openTheoryModule}
                    />
                  </div>
                </Reveal>
              )}
            </>
          )}

          {/* Module 4: Prompt Injection Lab View */}
          {activeModule === "prompt-injection" && (
            <PromptInjectionLab
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 5: Jailbreak Playground View */}
          {activeModule === "jailbreak-lab" && (
            <JailbreakLab
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 6: Adversarial ML Lab View */}
          {activeModule === "adversarial-ml" && (
            <AdversarialLab
              onStatusChange={setAiBusy}
            />
          )}

          {/* Module 7: AI Agent Security Lab View */}
          {activeModule === "agent-security" && (
            <AgentSecurityLab
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

          {/* Module 12: AI Failure Lab View */}
          {activeModule === "ai-failure-lab" && (
            <AiFailureLab
              instructorMode={instructorMode}
              onStatusChange={setAiBusy}
            />
          )}

          {/* Lab completion - rendered when the active lab is completed */}
          {activeModule !== "learning-hub" && completedLabs.has(activeModule) && (
            (() => {
              const brief = getLabBrief(activeModule);
              if (!brief) return null;
              return (
                <Reveal>
                  <LabCompletion
                    brief={brief}
                    onRetry={() => resetLab(activeModule)}
                    onNext={nextLabId ? handleNextLab : undefined}
                    nextLabel={nextLabId ? "Continue to next lab" : undefined}
                  />
                </Reveal>
              );
            })()
          )}
        </main>
      </div>

      <LabBriefDrawer />
    </div>
  );
}
