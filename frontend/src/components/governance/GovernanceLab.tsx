"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  GitCompare,
} from "lucide-react";
import { GOVERNANCE_PROJECTS, GOVERNANCE_PROJECT_BY_ID } from "@/data/governance";
import {
  assessGovernance,
  compareGovernance,
  askGovernance,
} from "@/services/governanceEngine";
import { ProjectSelector } from "./ProjectSelector";
import { ArchitectureExplorer } from "./ArchitectureExplorer";
import { ThreatWorkspace } from "./ThreatWorkspace";
import { ControlsSimulator } from "./ControlsSimulator";
import { RiskMatrix } from "./RiskMatrix";
import { GovernanceReview } from "./GovernanceReview";
import { SecurityReport } from "./SecurityReport";
import { ScenarioComparison } from "./ScenarioComparison";
import { Assistant } from "./Assistant";
import { InstructorPanel } from "./InstructorPanel";
import { useLabBrief } from "@/components/lab-brief/LabBriefContext";

interface GovernanceLabProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  onStatusChange: (processing: boolean) => void;
}

const STEPS = [
  { id: 0, title: "Project" },
  { id: 1, title: "Architecture" },
  { id: 2, title: "Risks" },
  { id: 3, title: "Controls" },
  { id: 4, title: "Residual Risk" },
  { id: 5, title: "Report" },
];

const CHEAP_MESSAGES = [
  "What does residual risk mean?",
  "Which control should I add first?",
  "What is STRIDE?",
  "How does NIST AI RMF structure this?",
];

interface AssistantQA {
  q: string;
  a: string;
}

export function GovernanceLab({
  instructorMode,
  onToggleInstructorMode,
  onStatusChange,
}: GovernanceLabProps) {
  const { markStarted, markCompleted, setMissionStep } = useLabBrief();
  const [projectId, setProjectId] = useState("resume_screening");
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [enabledControls, setEnabledControls] = useState<Set<string>>(
    () => new Set(GOVERNANCE_PROJECT_BY_ID.resume_screening?.baseline_controls ?? [])
  );
  const [selectedThreatId, setSelectedThreatId] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState("");
  const [qa, setQa] = useState<AssistantQA[]>([]);
  const [question, setQuestion] = useState("");

  const project = GOVERNANCE_PROJECT_BY_ID[projectId] ?? GOVERNANCE_PROJECTS[0];

  const result = useMemo(
    () => assessGovernance(projectId, Array.from(enabledControls)),
    [projectId, enabledControls]
  );
  const comparison = useMemo(() => compareGovernance(projectId), [projectId]);

  const setProcessing = useCallback(
    (val: boolean) => onStatusChange(val),
    [onStatusChange]
  );

  const goToStep = (target: number) => {
    if (target > 0 && target > maxReached) {
      markStarted("governance");
      setMissionStep("governance", Math.max(0, target - 1));
    }
    setStep(target);
    if (target > maxReached) setMaxReached(target);
    if (target === STEPS.length - 1) {
      markCompleted("governance");
    }
    setProcessing(false);
  };

  const handleSelectProject = (id: string) => {
    const p = GOVERNANCE_PROJECT_BY_ID[id];
    if (!p) return;
    setProjectId(id);
    setEnabledControls(new Set(p.baseline_controls));
    setSelectedComponentId(p.architecture[0]?.id ?? "");
    setSelectedThreatId("");
    setQa([]);
    goToStep(1);
  };

  const handleToggleControl = (id: string) => {
    setEnabledControls((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    setQa((prev) => [...prev, { q, a: askGovernance(q) }]);
    setQuestion("");
  };

  const selectedThreat = result.threats.find((t) => t.id === selectedThreatId) ?? result.threats[0];
  const activeThreatId = selectedThreat?.id ?? "";
  const activeComponentId =
    selectedComponentId || project.architecture[0]?.id || "";

  return (
    <div className="space-y-6">
      {/* status header */}
      <div className="cyber-panel border border-cyber-border p-4 rounded-lg flex items-center justify-between flex-wrap gap-3 holo-scan">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
            AI Risk Assessment & Governance Active
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {instructorMode && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Teaching mode on
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GOVERNANCE GATE REVIEW
          </span>
        </div>
      </div>

      {/* key question */}
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-[13px] text-cyan-100/90 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p>
          One question drives every screen here:{" "}
          <span className="font-mono text-cyan-300 font-bold">should this AI system be deployed?</span>{" "}
          Work the pipeline and decide - or decide to send it back for more work.
        </p>
      </div>

      {/* stepper */}
      <div className="flex items-center gap-1 flex-wrap select-none">
        {STEPS.map((s, i) => {
          const isActive = s.id === step;
          const reached = s.id <= maxReached;
          return (
            <React.Fragment key={s.id}>
              {i > 0 && <div className="w-3 h-px bg-cyber-border" />}
              <button
                onClick={() => reached && goToStep(s.id)}
                disabled={!reached}
                className={`px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider border transition-all ${
                  isActive
                    ? "bg-cyan-600 text-slate-950 border-cyan-500 font-bold"
                    : reached
                    ? "border-cyber-border text-cyber-muted hover:border-cyan-500/60 hover:text-cyan-300"
                    : "border-cyber-border text-slate-600 opacity-50 cursor-not-allowed"
                }`}
              >
                {s.id + 1}. {s.title}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* step body */}
      <div className="space-y-4">
        {step === 0 && (
          <ProjectSelector
            projects={GOVERNANCE_PROJECTS}
            selectedId={projectId}
            onSelect={handleSelectProject}
          />
        )}

        {step === 1 && (
          <ArchitectureExplorer
            architecture={result.architecture}
            selectedId={activeComponentId}
            onSelect={setSelectedComponentId}
          />
        )}

        {step === 2 && (
          <ThreatWorkspace
            threats={result.threats}
            selectedId={activeThreatId}
            onSelect={setSelectedThreatId}
          />
        )}

        {step === 3 && (
          <ControlsSimulator
            controls={result.controls}
            onToggle={handleToggleControl}
            residualScore={result.residual_score}
            residualLevel={result.residual_level}
            baseScore={result.base_score}
          />
        )}

        {step === 4 && (
          <>
            <RiskMatrix
              threats={result.threats}
              baseScore={result.base_score}
              residualScore={result.residual_score}
              baseLevel={result.base_level}
              residualLevel={result.residual_level}
            />
            <GovernanceReview review={result.governance_review} />
          </>
        )}

        {step === 5 && (
          <>
            <ScenarioComparison comparison={comparison} />
            <SecurityReport report={result.report} />
          </>
        )}
      </div>

      {/* step navigation */}
      <div className="flex items-center gap-3 flex-wrap">
        {step > 0 && (
          <button
            onClick={() => goToStep(step - 1)}
            className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button
            onClick={() => goToStep(step + 1)}
            className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-cyan-glow"
          >
            Next: {STEPS[step + 1].title} <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {step === STEPS.length - 1 && (
          <button
            onClick={() => goToStep(0)}
            className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            New Assessment
          </button>
        )}
        <button
          onClick={() => onToggleInstructorMode(!instructorMode)}
          className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <GraduationCap className="w-4 h-4" /> Teaching Mode
        </button>
      </div>

      {/* assistant + instructor */}
      {step >= 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 h-full">
            <div className="cyber-panel border border-cyber-border rounded-lg p-4 h-full">
              <div className="flex items-center gap-2 mb-2">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
                  Live Assessment Summary
                </h3>
              </div>
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
          <div className="lg:col-span-5 h-full">
            <Assistant
              qa={qa}
              question={question}
              onQuestion={setQuestion}
              onAsk={ask}
              examples={CHEAP_MESSAGES}
            />
          </div>
        </div>
      )}

      {instructorMode && step >= 2 && (
        <InstructorPanel context={result.instructor_context} />
      )}
    </div>
  );
}
