"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ShieldCheck, Play, RotateCcw, GraduationCap, Lock } from "lucide-react";
import { PRIVACY_SCENARIOS } from "@/data/privacy";
import { runScanSmart, fetchScanHistory, type PrivacyScanResult } from "@/services/privacyScanner";
import { DocumentViewer } from "@/components/privacy/DocumentViewer";
import { PrivacyFindingsPanel } from "@/components/privacy/PrivacyFindingsPanel";
import { PrivacyFindingDetail } from "@/components/privacy/PrivacyFindingDetail";
import { ClassificationPanel, PrivacyRiskPanel } from "@/components/privacy/ClassificationRiskPanels";
import { PolicyPanel } from "@/components/privacy/PolicyPanel";
import { RedactionPanel } from "@/components/privacy/RedactionPanel";
import { PrivacyTimeline } from "@/components/privacy/PrivacyTimeline";
import { PrivacyAssistant } from "@/components/privacy/PrivacyAssistant";
import { PrivacyInstructorPanel } from "@/components/privacy/PrivacyInstructorPanel";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { useLabBrief } from "@/components/lab-brief/LabBriefContext";

interface PrivacyLabProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  onStatusChange: (processing: boolean) => void;
}

export function PrivacyLab({
  instructorMode,
  onToggleInstructorMode,
  onStatusChange,
}: PrivacyLabProps) {
  const { markStarted, markCompleted, setMissionStep } = useLabBrief();
  const [selectedId, setSelectedId] = useState(PRIVACY_SCENARIOS[0].id);
  const [result, setResult] = useState<PrivacyScanResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const scenario = PRIVACY_SCENARIOS.find((s) => s.id === selectedId) ?? PRIVACY_SCENARIOS[0];

  const setProcessing = useCallback(
    (val: boolean) => {
      setIsProcessing(val);
      onStatusChange(val);
    },
    [onStatusChange]
  );

  const handleRun = async () => {
    if (isProcessing) return;
    setProcessing(true);
    setResult(null);
    setSelectedFindingId(null);
    markStarted("privacy-lab");
    const res = await runScanSmart(scenario.document, scenario.id);
    setResult(res);
    for (let i = 0; i < res.timeline.length; i++) {
      setActiveStage(i);
      setMissionStep("privacy-lab", i);
      await new Promise((r) => setTimeout(r, 320));
    }
    setActiveStage(null);
    setProcessing(false);
    markCompleted("privacy-lab");
  };

  const handleReset = () => {
    setResult(null);
    setSelectedFindingId(null);
    setActiveStage(null);
  };

  const selectedFinding = useMemo(
    () => result?.findings.find((f) => f.id === selectedFindingId) ?? null,
    [result, selectedFindingId]
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="cyber-panel border border-cyber-border p-4 rounded-lg flex items-center justify-between flex-wrap gap-3 holo-scan">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Privacy Protection Pipeline Active
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {instructorMode && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              Teaching mode on
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DEFENSIVE SANDBOX
          </span>
        </div>
      </div>

      {/* key message */}
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[13px] text-cyan-100/90 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p>
          AI is not the problem. Sending sensitive information without controls is the problem. This lab protects
          data <span className="font-mono text-cyan-300">before</span> it reaches a model - detect, classify, enforce
          policy, redact, then send a safe prompt.
        </p>
      </div>

      {/* controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Document</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isProcessing}
            className="h-9 px-3 rounded-md bg-slate-900 border border-cyber-border text-[12px] text-cyber-heading focus:outline-none focus:border-cyan-500/60"
          >
            {PRIVACY_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={handleRun}
          disabled={isProcessing}
          className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-cyan-glow"
        >
          <Play className="w-4 h-4" />
          {isProcessing ? "Scanning..." : "Run Privacy Scan"}
        </button>
        <button
          onClick={handleReset}
          disabled={isProcessing}
          className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={() => onToggleInstructorMode(!instructorMode)}
          disabled={isProcessing}
          className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
        >
          <GraduationCap className="w-4 h-4" />
          Teaching Mode
        </button>
      </div>

      {/* results */}
      {!result ? (
        <div className="cyber-panel border border-cyber-border rounded-lg p-10 text-center">
          <p className="text-sm text-cyber-muted mb-1.5">
            Pick a document and run a privacy scan to see what must be protected before any AI use.
          </p>
          <p className="text-[12px] font-mono text-slate-500">
            Scenario: {scenario.category} - {scenario.description}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* pipeline + policy */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 h-full">
              <PrivacyTimeline stages={result.timeline} isProcessing={isProcessing} activeStage={activeStage} />
            </div>
            <div className="lg:col-span-8 h-full">
              <PolicyPanel policies={result.policies} />
            </div>
          </div>

          {/* document viewer dominant + findings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 h-full">
              <DocumentViewer
                document={result.document}
                findings={result.findings}
                redacted={result.redaction.redacted}
                title={scenario.title}
                subtitle={scenario.category}
              />
            </div>
            <div className="lg:col-span-4 h-full">
              <PrivacyFindingsPanel
                findings={result.findings}
                selectedId={selectedFindingId}
                onSelect={(f) => setSelectedFindingId(f.id)}
                document={result.document}
              />
            </div>
          </div>

          {/* finding detail + classification/risk */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 h-full">
              {selectedFinding ? (
                <PrivacyFindingDetail finding={selectedFinding} />
              ) : (
                <div className="cyber-panel border border-cyber-border rounded-lg p-4 text-[12px] text-cyber-muted">
                  Select a finding on the left to see why the data is sensitive, why attackers want it, and how
                  organizations protect it.
                </div>
              )}
            </div>
            <div className="lg:col-span-4 h-full flex flex-col gap-4">
              <ClassificationPanel classification={result.classification} />
              <PrivacyRiskPanel risk={result.risk} />
            </div>
          </div>

          {/* redaction + assistant */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 h-full">
              <RedactionPanel redaction={result.redaction} safePrompt={result.safe_prompt} />
            </div>
            <div className="lg:col-span-4 h-full">
              <div className="h-[520px]">
                <PrivacyAssistant />
              </div>
            </div>
          </div>

          {/* summary + instructor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 h-full">
              <div className="cyber-panel border border-cyber-border rounded-lg p-4">
                <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono mb-2">
                  Scan Summary
                </h3>
                <ul className="space-y-1.5">
                  {result.summary.map((line, i) => (
                    <li key={i} className="text-[12px] text-cyber-muted leading-snug flex gap-2">
                      <span className="text-cyan-400 font-mono">-</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lg:col-span-8 h-full">
              {instructorMode ? (
                <PrivacyInstructorPanel context={result.instructor_context} />
              ) : (
                <div className="cyber-panel border border-cyber-border rounded-lg p-4 text-[12px] text-cyber-muted">
                  Enable Teaching Mode to reveal the concepts behind every finding and discussion questions for the
                  classroom.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* recent scans */}
      <HistoryPanel
        title="Recent Scans"
        fetchRows={async () => {
          const list = await fetchScanHistory(5);
          return list.map((s) => ({
            id: s.id,
            label: `${s.scenario_id.replace(/_/g, " ")} · ${s.findings_count} finding${s.findings_count === 1 ? "" : "s"}`,
            meta: new Date(s.timestamp).toLocaleString(),
            badge: `${s.classification} · ${s.risk_level}`,
          }));
        }}
        emptyText="Run a scan to populate history"
      />
    </div>
  );
}
