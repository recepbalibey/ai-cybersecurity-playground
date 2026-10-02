"use client";

import React from "react";
import { Gauge, CheckCircle2, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import type { AiFailureScorecard, AiFailureCalibration } from "@/services/aiFailureEngine";

interface ScorecardProps {
  scorecard: AiFailureScorecard | null;
  calibration: AiFailureCalibration | null;
}

export function Scorecard({ scorecard, calibration }: ScorecardProps) {
  return (
    <div className="space-y-4">
      <div className="cyber-panel border border-cyber-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-cyber-heading">
            Your verdict scorecard
          </h3>
        </div>
        {!scorecard || scorecard.total === 0 ? (
          <p className="text-[0.75rem] text-cyber-muted">
            Complete scenarios in the failure flow to build your scorecard. Verdicts are tracked as true positive, true negative, false positive, false negative, or uncertain.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-[0.75rem] text-status-success">
                <CheckCircle2 className="w-4 h-4" /> Correct: {scorecard.correct}
              </div>
              <div className="flex items-center gap-2 text-[0.75rem] text-status-danger">
                <XCircle className="w-4 h-4" /> Wrong: {scorecard.incorrect}
              </div>
              <div className="flex items-center gap-2 text-[0.75rem] text-cyber-muted">
                <HelpCircle className="w-4 h-4" /> Uncertain: {scorecard.uncertain}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-cyber-muted">
                  Accuracy on decided cases
                </span>
                <span className="text-sm font-mono font-bold text-accent">{scorecard.accuracy}%</span>
              </div>
              <div className="h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${scorecard.accuracy}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[0.75rem]">
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-status-danger shrink-0" />
                <span className="text-cyber-muted">
                  Trusted a wrong AI: <span className="font-mono text-status-danger">{scorecard.false_positives}</span>
                </span>
              </div>
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-status-warning shrink-0" />
                <span className="text-cyber-muted">
                  Distrusted a right AI: <span className="font-mono text-status-warning">{scorecard.false_negatives}</span>
                </span>
              </div>
            </div>
            <p className="text-[0.6875rem] text-cyber-muted leading-snug">{scorecard.insight}</p>
          </div>
        )}
      </div>

      <div className="cyber-panel border border-cyber-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-cyber-heading">
            Trust calibration
          </h3>
        </div>
        {!calibration || calibration.high.count + calibration.medium.count + calibration.low.count === 0 ? (
          <p className="text-[0.75rem] text-cyber-muted">
            Your stated confidence is compared against your actual correctness in three buckets. A well calibrated reviewer is right in the same proportion as their confidence.
          </p>
        ) : (
          <div className="space-y-3">
            {(
              [
                ["high", "High confidence (70%+)", "text-accent"],
                ["medium", "Medium confidence (30-69%)", "text-status-warning"],
                ["low", "Low confidence (under 30%)", "text-cyber-muted"],
              ] as const
            ).map(([key, label, color]) => {
              const bucket = calibration[key];
              const rate = bucket.correct_rate;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[0.6875rem] font-mono uppercase tracking-wider ${color}`}>{label}</span>
                    <span className="text-xs font-mono text-cyber-muted">
                      {bucket.count} verdict(s) -{" "}
                      {rate === null ? "no data" : `${rate}% correct`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
                    <div
                      className="h-full bg-cyber-surface-hover rounded-full"
                      style={{ width: `${rate === null ? 0 : rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-[0.6875rem] text-cyber-muted leading-snug">{calibration.insight}</p>
          </div>
        )}
      </div>
    </div>
  );
}
