"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, FlaskConical } from "lucide-react";
import type { AiFailureEvaluation } from "@/services/aiFailureEngine";

interface RevealStepProps {
  result: AiFailureEvaluation;
  onNext: () => void;
}

export function RevealStep({ result, onNext }: RevealStepProps) {
  const aiCorrect = result.ai_correct;
  const studentCorrect = result.student_verdict_correct;

  return (
    <div className="space-y-4">
      {/* Verdict outcome */}
      <div
        className={`rounded-lg border px-4 py-3 flex items-start gap-2.5 ${
          aiCorrect ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"
        }`}
      >
        {aiCorrect ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-[13px] text-cyber-heading font-bold">
            The AI was {aiCorrect ? "correct" : "incorrect"}
          </p>
          <p className="text-[12px] text-cyber-muted">
            Your verdict: <span className="font-mono text-cyan-300">{result.student_decision}</span> -{" "}
            {studentCorrect ? "correctly judged" : "did not match reality"}
          </p>
        </div>
      </div>

      {/* Ground truth */}
      <div className="cyber-panel border border-cyber-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Ground truth
          </h3>
        </div>
        <p className="text-[13px] text-cyber-text leading-relaxed">{result.ground_truth}</p>
      </div>

      {/* Why the AI failed */}
      <div className="cyber-panel border border-amber-500/40 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Why the AI failed - {result.failure_name}
          </h3>
        </div>
        <p className="text-[13px] text-cyber-text leading-relaxed">{result.explanation}</p>
      </div>

      {/* Security impact */}
      <div className="cyber-panel border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Security impact if trusted
          </h3>
        </div>
        <p className="text-[13px] text-cyber-text leading-relaxed">{result.security_impact}</p>
      </div>

      {/* Reliability before */}
      <div className="cyber-panel border border-cyan-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Reliability before mitigations
          </h3>
          <span className="text-sm font-mono font-bold text-cyan-300">{result.reliability.before}/100</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full"
            style={{ width: `${result.reliability.before}%` }}
          />
        </div>
        <p className="text-[11px] text-cyber-muted mt-2">
          A wrong AI with high confidence is the least reliable output there is.
        </p>
      </div>

      <button
        onClick={onNext}
        className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all"
      >
        Choose mitigations and retest
      </button>
    </div>
  );
}
