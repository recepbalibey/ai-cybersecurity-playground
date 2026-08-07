"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AlertTriangle, GraduationCap, ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react";
import { AI_FAILURE_SCENARIOS, AI_FAILURE_SCENARIO_BY_ID } from "@/data/aiFailures";
import {
  evaluateAiFailure,
  runAiFailureCapstone,
  aiFailureScorecard,
  aiFailureCalibration,
  askAiFailure,
  type StudentDecision,
  type ScorecardEntry,
} from "@/services/aiFailureEngine";
import { ScenarioSelector } from "./ScenarioSelector";
import { EvidenceStep } from "./EvidenceStep";
import { VerdictStep } from "./VerdictStep";
import { RevealStep } from "./RevealStep";
import { MitigationStep } from "./MitigationStep";
import { Capstone } from "./Capstone";
import { Scorecard } from "./Scorecard";
import { KnowledgeExplorer } from "./KnowledgeExplorer";
import { Assistant } from "./Assistant";
import { InstructorPanel } from "./InstructorPanel";

interface AiFailureLabProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  onStatusChange: (processing: boolean) => void;
}

type View =
  | { kind: "scenarios" }
  | { kind: "standard"; step: number }
  | { kind: "capstone" }
  | { kind: "scorecard" }
  | { kind: "knowledge" };

interface StandardState {
  scenarioId: string;
  showAi: boolean;
  studentPredict: string | null;
  decision: StudentDecision | null;
  confidence: number;
  selectedMitigations: string[];
  result: ReturnType<typeof evaluateAiFailure> | null;
}

const CHEAP_MESSAGES = [
  "What is a false positive?",
  "Why is hallucination dangerous?",
  "How does automation bias work?",
  "What makes confidence calibrated?",
];

interface AssistantQA {
  q: string;
  a: string;
}

const STANDARD_STEPS = [
  { id: 0, title: "Evidence" },
  { id: 1, title: "Verdict" },
  { id: 2, title: "Ground Truth" },
  { id: 3, title: "Mitigations" },
];

export function AiFailureLab({
  instructorMode,
  onToggleInstructorMode,
  onStatusChange,
}: AiFailureLabProps) {
  const [view, setView] = useState<View>({ kind: "scenarios" });
  const [scenarioId, setScenarioId] = useState("soc_false_positive");
  const [challengeMode, setChallengeMode] = useState(false);
  const [standard, setStandard] = useState<StandardState>({
    scenarioId: "soc_false_positive",
    showAi: false,
    studentPredict: null,
    decision: null,
    confidence: 50,
    selectedMitigations: [],
    result: null,
  });
  const [capstonePicks, setCapstonePicks] = useState<Record<string, string>>({});
  const [capstoneResult, setCapstoneResult] = useState<ReturnType<typeof runAiFailureCapstone> | null>(null);
  const [verdictHistory, setVerdictHistory] = useState<ScorecardEntry[]>([]);
  const [qa, setQa] = useState<AssistantQA[]>([]);
  const [question, setQuestion] = useState("");

  const setProcessing = useCallback((v: boolean) => onStatusChange(v), [onStatusChange]);

  const scenario = AI_FAILURE_SCENARIO_BY_ID[scenarioId] ?? AI_FAILURE_SCENARIOS[0];
  const isCapstone = Array.isArray(scenario.capstone_events);
  const capstoneEvents = scenario.capstone_events ?? [];

  const scorecard = useMemo(() => aiFailureScorecard(verdictHistory), [verdictHistory]);
  const calibration = useMemo(() => aiFailureCalibration(verdictHistory), [verdictHistory]);

  const resetStandard = () => {
    setStandard({
      scenarioId,
      showAi: false,
      studentPredict: null,
      decision: null,
      confidence: 50,
      selectedMitigations: [],
      result: null,
    });
  };

  const handleSelectScenario = (id: string) => {
    const s = AI_FAILURE_SCENARIO_BY_ID[id];
    if (!s) return;
    setScenarioId(id);
    setCapstonePicks({});
    setCapstoneResult(null);
    if (Array.isArray(s.capstone_events)) {
      setView({ kind: "capstone" });
    } else {
      setStandard((prev) => ({
        ...prev,
        scenarioId: id,
        showAi: false,
        studentPredict: null,
        decision: null,
        confidence: 50,
        selectedMitigations: [],
        result: null,
      }));
      setView({ kind: "standard", step: 0 });
    }
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    setQa((prev) => [...prev, { q, a: askAiFailure(q) }]);
    setQuestion("");
  };

  const handleVerdictSubmit = () => {
    if (!standard.decision) return;
    setProcessing(true);
    const result = evaluateAiFailure(
      standard.scenarioId,
      standard.decision,
      standard.selectedMitigations,
      standard.confidence
    );
    setVerdictHistory((prev) => [
      ...prev,
      { student_verdict_class: result.student_verdict_class, student_confidence: result.student_confidence },
    ]);
    setStandard((prev) => ({ ...prev, result }));
    setProcessing(false);
    setView({ kind: "standard", step: 2 });
  };

  const renderView = () => {
    if (view.kind === "scenarios") {
      return <ScenarioSelector scenarios={AI_FAILURE_SCENARIOS} selectedId={scenarioId} onSelect={handleSelectScenario} />;
    }

    if (view.kind === "standard") {
      const step = view.step;
      return (
        <div className="space-y-4">
          {/* step indicator */}
          <div className="flex items-center gap-1 flex-wrap select-none">
            {STANDARD_STEPS.map((s, i) => {
              const isActive = s.id === step;
              const reached = s.id <= step;
              return (
                <React.Fragment key={s.id}>
                  {i > 0 && <div className="w-3 h-px bg-cyber-border" />}
                  <button
                    onClick={() => reached && setView({ kind: "standard", step: s.id })}
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

          {step === 0 && (
            <EvidenceStep
              inputData={scenario.input_data}
              aiOutput={scenario.ai_output}
              aiConfidence={scenario.ai_confidence}
              showAi={standard.showAi}
              studentPredict={standard.studentPredict}
              challengeMode={challengeMode}
              onPredict={(label) => setStandard((prev) => ({ ...prev, studentPredict: label }))}
              onCommit={() => setStandard((prev) => ({ ...prev, showAi: true }))}
              onRevealAi={() => setStandard((prev) => ({ ...prev, showAi: true }))}
            />
          )}

          {step === 1 && (
            <VerdictStep
              decision={standard.decision}
              confidence={standard.confidence}
              onDecision={(d) => setStandard((prev) => ({ ...prev, decision: d }))}
              onConfidence={(v) => setStandard((prev) => ({ ...prev, confidence: v }))}
              onSubmit={handleVerdictSubmit}
            />
          )}

          {step === 2 && standard.result && (
            <RevealStep result={standard.result} onNext={() => setView({ kind: "standard", step: 3 })} />
          )}

          {step === 3 && standard.result && (
            <MitigationStep
              result={standard.result}
              selected={standard.selectedMitigations}
              onToggle={(id) =>
                setStandard((prev) => ({
                  ...prev,
                  selectedMitigations: prev.selectedMitigations.includes(id)
                    ? prev.selectedMitigations.filter((m) => m !== id)
                    : [...prev.selectedMitigations, id],
                }))
              }
              onRetest={() => {
                const updated = evaluateAiFailure(
                  standard.scenarioId,
                  standard.decision ?? "uncertain",
                  standard.selectedMitigations,
                  standard.confidence
                );
                setStandard((prev) => ({ ...prev, result: updated }));
              }}
              onReset={() => {
                setView({ kind: "scenarios" });
                resetStandard();
              }}
            />
          )}

          {/* navigation */}
          <div className="flex items-center gap-3 flex-wrap">
            {step > 0 ? (
              <button
                onClick={() => setView({ kind: "standard", step: step - 1 })}
                className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={() => setView({ kind: "scenarios" })}
                className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Scenarios
              </button>
            )}
            {step < STANDARD_STEPS.length - 1 && step === 0 && (
              <button
                onClick={() => setView({ kind: "standard", step: 1 })}
                disabled={!standard.showAi}
                className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-cyan-glow"
              >
                Next: Verdict <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (view.kind === "capstone") {
      return (
        <Capstone
          scenarioId={scenario.id}
          events={capstoneEvents}
          picks={capstonePicks}
          result={capstoneResult}
          onPick={(eventId, verdict) =>
            setCapstonePicks((prev) => ({ ...prev, [eventId]: verdict }))
          }
          onRun={() => {
            setProcessing(true);
            const result = runAiFailureCapstone(scenario.id, capstonePicks);
            setCapstoneResult(result);
            setProcessing(false);
          }}
        />
      );
    }

    if (view.kind === "scorecard") {
      return <Scorecard scorecard={scorecard} calibration={calibration} />;
    }

    return <KnowledgeExplorer />;
  };

  return (
    <div className="space-y-6">
      {/* status header */}
      <div className="cyber-panel border border-cyber-border p-4 rounded-lg flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
            AI Failure Lab Active
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {instructorMode && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Teaching mode on
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-1 rounded border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            RELIABILITY VALIDATION
          </span>
        </div>
      </div>

      {/* key question */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-100/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p>
          One question drives every screen here:{" "}
          <span className="font-mono text-amber-300 font-bold">is this AI output correct?</span>{" "}
          Judge the AI, see the ground truth, and choose mitigations that raise reliability.
        </p>
      </div>

      {/* view tabs */}
      <div className="flex items-center gap-1 flex-wrap select-none">
        {(
          [
            ["scenarios", "Scenarios"],
            ["scorecard", "Scorecard"],
            ["knowledge", "Why AI fails"],
          ] as const
        ).map(([kind, label]) => {
          const active = view.kind === kind;
          return (
            <button
              key={kind}
              onClick={() => setView({ kind } as View)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider border transition-all ${
                active
                  ? "bg-cyan-600 text-slate-950 border-cyan-500 font-bold"
                  : "border-cyber-border text-cyber-muted hover:border-cyan-500/60 hover:text-cyan-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* challenge mode toggle for standard flow */}
      {view.kind === "standard" && view.step === 0 && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[12px] text-cyber-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={challengeMode}
              onChange={(e) => setChallengeMode(e.target.checked)}
              className="accent-amber-500"
            />
            Human vs AI mode - commit your verdict before the AI's is shown
          </label>
          <button
            onClick={() => {
              resetStandard();
              setView({ kind: "scenarios" });
            }}
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> reset scenario
          </button>
        </div>
      )}

      {/* body */}
      <div className="space-y-4">{renderView()}</div>

      {/* assistant + instructor */}
      {view.kind === "standard" && standard.result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 h-full">
            <div className="cyber-panel border border-cyber-border rounded-lg p-4 h-full">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
                  Reliability Summary
                </h3>
              </div>
              <ul className="space-y-1.5">
                {standard.result.summary.map((line, i) => (
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

      {instructorMode && view.kind === "standard" && standard.result && (
        <InstructorPanel
          teachingPoints={standard.result.instructor_context.teaching_points}
          discussionQuestions={standard.result.instructor_context.discussion_questions}
          learningObjective={standard.result.learning_objective}
          failureName={standard.result.failure_name}
        />
      )}

      {instructorMode && view.kind === "capstone" && (
        <InstructorPanel
          teachingPoints={scenario.teaching_points ?? []}
          discussionQuestions={[
            "Why did the AI miss two real attacks under pressure?",
            "Where did you and the AI disagree, and who was right?",
            "What combined control makes human plus AI beat either alone?",
          ]}
          learningObjective={scenario.learning_objective}
          failureName="Capstone"
        />
      )}
    </div>
  );
}
