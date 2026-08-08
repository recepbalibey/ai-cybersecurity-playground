"use client";

import React, { useState, useCallback } from "react";
import { ShieldCheck, Play, RotateCcw, GraduationCap, Sparkles } from "lucide-react";
import { REVIEW_EXAMPLES, type RiskLevel } from "@/data/securityCode";
import {
  reviewCode,
  compareReview,
  askReviewer,
  INSTRUCTOR,
  type ReviewResult,
  type CodeFinding,
} from "@/services/securityCodeReviewer";
import { CodeEditorPanel } from "./CodeEditorPanel";
import { SecurityScorePanel } from "./SecurityScorePanel";
import { FindingsPanel } from "./FindingsPanel";
import { FindingDetailPanel } from "./FindingDetailPanel";
import { FixDiffViewer } from "./FixDiffViewer";
import { ReviewFlowPanel } from "./ReviewFlowPanel";
import { SecureDevChecklist } from "./SecureDevChecklist";
import { ReviewComparisonPanel } from "./ReviewComparisonPanel";
import { InstructorPanel } from "./InstructorPanel";
import { useLabBrief } from "@/components/lab-brief/LabBriefContext";

interface CodeReviewLabProps {
  instructorMode: boolean;
  onToggleInstructorMode: (val: boolean) => void;
  onStatusChange: (processing: boolean) => void;
}

const CHEAP_MESSAGES = [
  "Does the AI replace the human reviewer?",
  "Which finding is the highest risk?",
  "What does CWE stand for and why map it?",
  "How does AI fit into a DevSecOps pipeline?",
];

interface AssistantQA {
  q: string;
  a: string;
}

export function CodeReviewLab({
  instructorMode,
  onToggleInstructorMode,
  onStatusChange,
}: CodeReviewLabProps) {
  const { markStarted, markCompleted } = useLabBrief();
  const [code, setCode] = useState(() => REVIEW_EXAMPLES[0].vulnerable_code);
  const [language, setLanguage] = useState<string>(REVIEW_EXAMPLES[0].language);
  const [exampleId, setExampleId] = useState<string>(REVIEW_EXAMPLES[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [qa, setQa] = useState<AssistantQA[]>([]);
  const [question, setQuestion] = useState("");

  const setProcessing = useCallback(
    (val: boolean) => {
      setIsProcessing(val);
      onStatusChange(val);
    },
    [onStatusChange]
  );

  const handleSelectExample = (id: string) => {
    const ex = REVIEW_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setCode(ex.vulnerable_code);
    setLanguage(ex.language);
    setExampleId(id);
    setResult(null);
    setSelectedFindingId(null);
  };

  const handleRun = async () => {
    if (isProcessing || !code.trim()) return;
    setProcessing(true);
    setResult(null);
    setSelectedFindingId(null);
    setQa([]);
    markStarted("code-review");
    await new Promise((r) => setTimeout(r, 450));
    const res = reviewCode(code, language, exampleId || null);
    setResult(res);
    setSelectedFindingId(res.findings[0]?.id ?? null);
    setProcessing(false);
    markCompleted("code-review");
  };

  const handleReset = () => {
    setResult(null);
    setSelectedFindingId(null);
    setQa([]);
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    setQa((prev) => [...prev, { q, a: askReviewer(q, exampleId || null) }]);
    setQuestion("");
  };

  const selectedFinding: CodeFinding | null =
    result?.findings.find((f) => f.id === selectedFindingId) ?? null;

  return (
    <div className="space-y-6">
      {/* status header */}
      <div className="cyber-panel border border-cyber-border p-4 rounded-lg flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
            AI Security Code Review Active
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
            DEFENSIVE / ASSISTED REVIEW
          </span>
        </div>
      </div>

      {/* primary editor - dominant */}
      <CodeEditorPanel
        code={code}
        onCodeChange={setCode}
        language={language}
        onLanguageChange={setLanguage}
        exampleId={exampleId}
        onExampleChange={setExampleId}
        onSelectExample={handleSelectExample}
        onRun={handleRun}
        onReset={handleReset}
        isRunning={isProcessing}
        teaching={instructorMode}
        onToggleTeaching={() => onToggleInstructorMode(!instructorMode)}
        findings={result?.findings ?? []}
        result={result ?? undefined}
      />

      {/* quick actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleRun}
          disabled={isProcessing || !code.trim()}
          className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-cyan-glow"
        >
          <Play className="w-4 h-4" /> {isProcessing ? "Reviewing..." : "Run Review"}
        </button>
        <button
          onClick={handleReset}
          disabled={isProcessing}
          className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button
          onClick={() => onToggleInstructorMode(!instructorMode)}
          disabled={isProcessing}
          className="px-4 h-9 rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
        >
          <GraduationCap className="w-4 h-4" /> Teaching Mode
        </button>
      </div>

      {/* layout: findings + detail + score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 h-full flex flex-col gap-4">
          <FindingsPanel
            findings={result?.findings ?? []}
            selectedId={selectedFindingId}
            onSelect={(f) => setSelectedFindingId(f.id)}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          {selectedFinding ? (
            <FindingDetailPanel finding={selectedFinding} />
          ) : result ? (
            <ReviewFlowPanel stages={result.workflow} active={isProcessing} done={!isProcessing} />
          ) : (
            <IntroPanel onExample={handleSelectExample} />
          )}
        </div>
      </div>

      {/* results grid */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 h-full flex flex-col gap-4">
            <SecurityScorePanel
              before={result.security_score.before}
              after={result.security_score.after}
              confidence={result.confidence}
              risk={result.risk_level}
            />
            <ReviewFlowPanel stages={result.workflow} active={false} done />
          </div>
          <div className="lg:col-span-9 h-full">
            <FixDiffViewer
              before={result.fix.before}
              after={result.fix.after}
              improvements={result.fix.improvements}
              language={result.language}
            />
          </div>
        </div>
      )}

      {/* bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 h-full flex flex-col gap-4">
          {result && <ReviewComparisonPanel comparison={undefined} hasResult />}
        </div>
        <div className="lg:col-span-4 h-full">
          <SecureDevChecklist />
        </div>
        <div className="lg:col-span-3 h-full">
          <AssistantPanel qa={qa} question={question} onQuestion={setQuestion} onAsk={ask} examples={CHEAP_MESSAGES} />
        </div>
      </div>

      {instructorMode && (
        <InstructorPanel context={result?.instructor_context ?? INSTRUCTOR} />
      )}
    </div>
  );
}

function IntroPanel({ onExample }: { onExample: (id: string) => void }) {
  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-6 text-center flex flex-col items-center gap-3">
      <Sparkles className="w-8 h-8 text-cyan-400" />
      <h3 className="text-sm font-bold text-cyber-heading">Is this code secure?</h3>
      <p className="text-[13px] text-cyber-muted max-w-md">
        Load an educational example or paste your own code, then run a review to find
        vulnerabilities, learn their risk, and see a secure fix.
      </p>
      <button
        onClick={() => onExample(REVIEW_EXAMPLES[0].id)}
        className="mt-1 px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-cyan-glow"
      >
        Load first example
      </button>
    </div>
  );
}

function AssistantPanel({ qa, question, onQuestion, onAsk, examples }: {
  qa: AssistantQA[]; question: string; onQuestion: (v: string) => void; onAsk: (q: string) => void; examples: string[];
}) {
  return (
    <div className="cyber-panel border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Review Assistant</h3>
      </div>
      <div className="flex-1 min-h-[120px] max-h-64 overflow-auto p-3 space-y-2">
        {qa.length === 0 && (
          <p className="text-[11px] text-cyber-muted">Ask about the review, OWASP, CWE, or deploying secure code.</p>
        )}
        {qa.map((x, i) => (
          <div key={i} className="space-y-1">
            <div className="text-[11px] font-mono text-cyan-300 ml-auto w-fit max-w-[85%] rounded-md bg-slate-800/60 px-2 py-1">
              {x.q}
            </div>
            <div className="text-[11px] text-cyber-muted rounded-md bg-slate-900/60 px-2 py-1 leading-snug">
              {x.a}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-cyber-border space-y-2">
        <div className="flex gap-1 flex-wrap">
          {examples.map((e) => (
            <button
              key={e}
              onClick={() => onAsk(e)}
              className="text-[10px] px-2 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300"
            >
              {e}
            </button>
          ))}
        </div>
        <form
          className="flex gap-1.5"
          onSubmit={(ev) => {
            ev.preventDefault();
            onAsk(question);
          }}
        >
          <input
            value={question}
            onChange={(e) => onQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 h-8 min-w-0 px-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-cyber-heading focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="h-8 px-3 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}