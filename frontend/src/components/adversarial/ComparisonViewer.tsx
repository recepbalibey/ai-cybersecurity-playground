"use client";

import React, { useState } from "react";
import { ScanFace, ArrowRight } from "lucide-react";
import { SyntheticFace, predictionLabel } from "@/components/adversarial/SyntheticFace";
import { VisionAnalysisResult, Prediction, OutcomeType } from "@/services/visionSecurity";

interface ComparisonViewerProps {
  result: VisionAnalysisResult | null;
  isProcessing: boolean;
}

function PredCard({
  title,
  pred,
  overlay,
  accent,
}: {
  title: string;
  pred: Prediction;
  overlay: "none" | "noise" | "occlusion" | "transformation";
  accent: string;
}) {
  const max = Math.max(...pred.logits.map((l) => l.probability), 0.0001);
  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg flex-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6875rem] font-mono text-cyber-muted uppercase tracking-wider">{title}</span>
        <span className={`text-[0.625rem] font-mono px-2 py-0.5 rounded border ${accent}`}>
          {Math.round(pred.confidence)}% conf
        </span>
      </div>
      <div className="flex justify-center">
        <div className="relative rounded-xl bg-cyber-base/80 border border-cyber-border p-2">
          <SyntheticFace subject={pred.prediction} overlay={overlay} size={150} />
          <span className="absolute bottom-1 right-2 text-[0.625rem] font-mono text-accent">
            {overlay !== "none" ? overlay.toUpperCase() : "ORIGINAL"}
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="text-xs font-bold text-cyber-heading">{predictionLabel(pred.prediction)}</div>
        <div className="text-[0.625rem] font-mono text-cyber-muted">predicted class</div>
      </div>
      <div className="mt-3 space-y-1.5">
        {pred.logits.map((l) => (
          <div key={l.subject} className="flex items-center gap-2">
            <span className="w-16 text-[0.625rem] font-mono text-cyber-muted truncate">
              {predictionLabel(l.subject)}
            </span>
            <div className="flex-1 h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${l.subject === pred.prediction ? "bg-cyan-500" : "bg-cyber-surface-hover"}`}
                style={{ width: `${(l.probability / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-[0.625rem] font-mono text-cyber-text">
              {Math.round(l.probability * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function outcomeBadge(outcome: OutcomeType): { label: string; cls: string } {
  switch (outcome) {
    case "misclassified":
      return { label: "MISCLASSIFIED", cls: "border-rose-500/50 text-status-danger bg-status-danger/10" };
    case "blocked":
      return { label: "ATTACK BLOCKED", cls: "border-emerald-500/50 text-status-success bg-status-success/10" };
    case "defended":
      return { label: "DEFENSE HELD", cls: "border-cyan-500/50 text-accent bg-accent/10" };
    default:
      return { label: "CLEAN", cls: "border-cyber-border text-cyber-text bg-cyber-base" };
  }
}

const OVERLAY_MAP: Record<string, "noise" | "occlusion" | "transformation" | "none"> = {
  noise: "noise",
  occlusion: "occlusion",
  transformation: "transformation",
};

export function ComparisonViewer({ result, isProcessing }: ComparisonViewerProps) {
  const [showBefore, setShowBefore] = useState(true);
  const badge = outcomeBadge(result?.outcome ?? "clean");
  const overlay = OVERLAY_MAP[result?.attack_type ?? "noise"] ?? "none";

  if (result?.is_defense_comparison && result.vulnerable && result.protected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ScanFace className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-cyber-heading">
              Same Input - Two Models
            </h3>
          </div>
          <span className={`text-[0.625rem] font-mono px-2 py-1 rounded border ${badge.cls}`}>{badge.label}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="cyber-panel border border-rose-500/30 p-4 rounded-lg flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-status-danger">{result.vulnerable.name}</span>
              <span className="text-[0.625rem] font-mono text-cyber-muted">clean acc {result.vulnerable.clean_accuracy}%</span>
            </div>
            <div className="flex justify-center">
              <SyntheticFace subject={result.vulnerable.adversarial_prediction || "alpha"} overlay={overlay} size={150} />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold text-cyber-heading">
                {predictionLabel(result.vulnerable.adversarial_prediction || "alpha")}
              </div>
              <div className="text-[0.625rem] font-mono text-status-danger">flipped - attack succeeds</div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[0.625rem] font-mono mb-1">
                <span className="text-cyber-muted">Robustness</span>
                <span className="text-status-danger">{result.vulnerable.robustness}%</span>
              </div>
              <div className="h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${result.vulnerable.robustness}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-accent" />
          </div>

          <div className="cyber-panel border border-emerald-500/30 p-4 rounded-lg flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-status-success">{result.protected.name}</span>
              <span className="text-[0.625rem] font-mono text-cyber-muted">clean acc {result.protected.clean_accuracy}%</span>
            </div>
            <div className="flex justify-center">
              <SyntheticFace subject={result.protected.clean_prediction || "alpha"} overlay={overlay} size={150} />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold text-cyber-heading">
                {predictionLabel(result.protected.clean_prediction || "alpha")}
              </div>
              <div className="text-[0.625rem] font-mono text-status-success">held - adversarial training</div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[0.625rem] font-mono mb-1">
                <span className="text-cyber-muted">Robustness</span>
                <span className="text-status-success">{result.protected.robustness}%</span>
              </div>
              <div className="h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${result.protected.robustness}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ScanFace className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold text-cyber-heading">
            Before / After Prediction
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBefore((v) => !v)}
            className={`text-[0.625rem] font-mono px-2.5 py-1.5 rounded-md border transition-all ${
              showBefore
                ? "bg-accent/10 border-cyan-500/50 text-accent"
                : "bg-cyber-base border-cyber-border text-cyber-muted hover:text-cyber-text"
            }`}
          >
            {showBefore ? "▲ BEFORE" : "▼ AFTER"}
          </button>
          <span className={`text-[0.625rem] font-mono px-2 py-1 rounded border ${badge.cls}`}>{badge.label}</span>
        </div>
      </div>

      {isProcessing ? (
        <div className="cyber-panel border border-cyber-border p-6 rounded-lg flex items-center justify-center gap-3">
          <span className="electron" style={{ "--orb-size": "18px" } as React.CSSProperties}>
            <i />
            <i />
          </span>
          <span className="text-xs font-mono text-cyber-muted animate-pulse">Running adversarial inference…</span>
        </div>
      ) : result ? (
        <div className="flex flex-col md:flex-row gap-4">
          <PredCard title="Clean Input" pred={result.before} overlay="none" accent="border-cyber-border text-cyber-text bg-cyber-base" />
          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-accent" />
          </div>
          <PredCard title="Adversarial Input" pred={result.after} overlay={overlay} accent="border-rose-500/50 text-status-danger bg-status-danger/10" />
        </div>
      ) : (
        <div className="cyber-panel border border-cyber-border p-6 rounded-lg flex items-center justify-center">
          <span className="text-xs font-mono text-cyber-muted">Select an experiment and run it to see the before/after comparison.</span>
        </div>
      )}

      {!isProcessing && result && (
        <div className="flex items-center gap-3 p-3 rounded-md bg-cyber-base/60 border border-cyber-border">
          <span className="text-[0.625rem] font-mono text-cyber-muted uppercase">Confidence gap</span>
          <div className="flex-1 h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
            <div
              className={`h-full rounded-full ${result.confidence_gap > 30 ? "bg-rose-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, result.confidence_gap)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-cyber-heading">-{result.confidence_gap}%</span>
        </div>
      )}
    </div>
  );
}
