"use client";

import React from "react";
import { FileText, BrainCircuit, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface EvidenceStepProps {
  inputData: string;
  aiOutput: string;
  aiConfidence: number;
  showAi: boolean;
  studentPredict?: string | null;
  challengeMode: boolean;
  onPredict: (label: string) => void;
  onCommit: () => void;
  onRevealAi: () => void;
}

const PREDICT_LABELS = [
  { value: "benign", label: "Benign" },
  { value: "attack", label: "Attack" },
  { value: "insufficient_evidence", label: "Not enough evidence" },
  { value: "ambiguous", label: "Ambiguous" },
];

export function EvidenceStep({
  inputData,
  aiOutput,
  aiConfidence,
  showAi,
  studentPredict,
  challengeMode,
  onPredict,
  onCommit,
  onRevealAi,
}: EvidenceStepProps) {
  return (
    <div className="space-y-4">
      {/* Evidence */}
      <div className="cyber-panel border border-cyber-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Evidence
          </h3>
        </div>
        <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-cyber-text font-mono bg-slate-950/60 rounded-md p-3 border border-slate-800">
          {inputData}
        </pre>
      </div>

      {/* Challenge mode: student predicts BEFORE seeing AI */}
      {challengeMode && !studentPredict && (
        <div className="cyber-panel border border-amber-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Human vs AI - your call first
            </h3>
          </div>
          <p className="text-[12px] text-cyber-muted mb-3">
            Commit to your own verdict before the AI's decision is revealed. Then compare your judgment against the model.
          </p>
          <div className="flex flex-wrap gap-2">
            {PREDICT_LABELS.map((l) => (
              <button
                key={l.value}
                onClick={() => onPredict(l.value)}
                className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:border-amber-500/60 hover:text-amber-300 text-xs font-semibold transition-all"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Student verdict committed: lock in and go to AI */}
      {challengeMode && studentPredict && !showAi && (
        <div className="cyber-panel border border-amber-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              Your verdict locked in
            </h3>
          </div>
          <p className="text-[12px] text-cyan-200 mb-3">
            You predicted: <span className="font-mono font-bold">{studentPredict.replace(/_/g, " ")}</span>
          </p>
          <button
            onClick={onRevealAi}
            className="px-4 h-9 rounded-md bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <EyeOff className="w-4 h-4" /> Reveal the AI's decision
          </button>
        </div>
      )}

      {/* AI output (revealed after student commits or in normal mode) */}
      {showAi && (
        <div className="cyber-panel border border-cyan-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              AI decision
            </h3>
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 text-cyan-300">
              confidence {aiConfidence}%
            </span>
          </div>
          <p className="text-[13px] text-cyber-text leading-relaxed">{aiOutput}</p>
          {challengeMode && studentPredict && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              You predicted: <span className="text-amber-300">{studentPredict.replace(/_/g, " ")}</span>
              vs
              <span className="text-cyan-300">AI: {aiOutput.includes("benign") || aiOutput.includes("No") || aiOutput.includes("Low risk") ? "benign" : "attack"}</span>
            </div>
          )}
        </div>
      )}

      {/* Commit / continue */}
      {!challengeMode && !showAi && (
        <button
          onClick={onCommit}
          className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-cyan-glow"
        >
          <XCircle className="w-4 h-4" /> I have studied the evidence
        </button>
      )}
      {!challengeMode && showAi && (
        <p className="text-[11px] text-cyber-muted">
          The AI's decision and confidence are above. Judge whether the AI output was correct before the next step.
        </p>
      )}
    </div>
  );
}
