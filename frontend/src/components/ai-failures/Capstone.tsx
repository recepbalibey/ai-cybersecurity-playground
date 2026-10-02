"use client";

import React from "react";
import { Siren, CheckCircle2, XCircle } from "lucide-react";
import type { AiFailureCapstone, CapstoneEventResult } from "@/services/aiFailureEngine";

interface CapstoneProps {
  events: { id: string; title: string; evidence: string }[];
  picks: Record<string, string>;
  result: AiFailureCapstone | null;
  onPick: (eventId: string, verdict: string) => void;
  onRun: () => void;
  isProcessing?: boolean;
}

const VERDICT_OPTIONS = [
  { value: "attack", label: "Attack" },
  { value: "benign", label: "Benign" },
];

function renderEventRow(ev: CapstoneEventResult) {
  return (
    <div key={ev.id} className="rounded-md border border-cyber-border p-3">
      <div className="flex items-center gap-2 mb-1">
        <Siren className="w-3.5 h-3.5 text-accent shrink-0" />
        <span className="text-[0.8125rem] font-bold text-cyber-heading">{ev.id} - {ev.title}</span>
      </div>
      <p className="text-[0.6875rem] text-cyber-muted mb-2 leading-snug">{ev.evidence}</p>
      <div className="flex items-center gap-3 flex-wrap text-[0.6875rem] font-mono">
        <span className="text-cyber-muted">
          You: <span className={ev.human_correct ? "text-status-success" : "text-status-danger"}>{ev.student_verdict ?? "-"}</span>
        </span>
        <span className="text-cyber-muted">
          AI: <span className={ev.ai_correct ? "text-status-success" : "text-status-danger"}>{ev.ai_verdict}</span>
        </span>
        <span className="text-cyber-muted">
          Truth: <span className="text-accent">{ev.ground_truth}</span>
        </span>
        {ev.combined_correct ? (
          <span className="flex items-center gap-1 text-status-success">
            <CheckCircle2 className="w-3 h-3" /> caught
          </span>
        ) : (
          <span className="flex items-center gap-1 text-status-danger">
            <XCircle className="w-3 h-3" /> missed by both
          </span>
        )}
      </div>
      <p className="text-[0.6875rem] text-cyber-muted mt-2 leading-snug">{ev.detail}</p>
    </div>
  );
}

export function Capstone({
  events,
  picks,
  result,
  onPick,
  onRun,
  isProcessing = false,
}: CapstoneProps) {
  const allPicked = events.every((ev) => picks[ev.id]);
  const ready = allPicked && !result;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-[0.8125rem] text-status-danger flex items-start gap-2.5">
        <Siren className="w-4 h-4 text-status-danger mt-0.5 shrink-0" />
        <p>
          Six events arrive in one minute during a live incident. Triage each event yourself,{" "}
          <span className="font-mono text-status-danger">before</span> scoring. Then compare AI alone, you alone, and combined.
        </p>
      </div>

      {!result && (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="rounded-md border border-cyber-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Siren className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-[0.8125rem] font-bold text-cyber-heading">{ev.id} - {ev.title}</span>
              </div>
              <p className="text-[0.75rem] text-cyber-muted mb-3 leading-snug">{ev.evidence}</p>
              <div className="flex flex-wrap gap-2">
                {VERDICT_OPTIONS.map((o) => {
                  const active = picks[ev.id] === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => onPick(ev.id, o.value)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${
                        active
                          ? "bg-accent/10 border-cyan-500/60 text-accent"
                          : "border-cyber-border text-cyber-text hover:border-cyan-500/60 hover:text-accent"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={onRun}
            disabled={!ready || isProcessing}
            className="px-4 h-9 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-on-accent text-xs font-bold transition-all"
          >
            {isProcessing ? "Scoring…" : allPicked ? "Score the capstone" : "Pick a verdict for every event"}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Accuracy comparison */}
          <div className="cyber-panel border border-cyber-border rounded-lg p-4">
            <h3 className="text-xs font-bold text-cyber-heading mb-3">
              AI alone vs human alone vs combined
            </h3>
            <div className="space-y-3">
              {(
                [
                  ["AI alone", result.ai_accuracy, result.ai_total, "text-accent"],
                  ["You alone", result.human_accuracy, result.human_total, "text-status-warning"],
                  ["Combined", result.combined_accuracy, result.combined_total, "text-status-success"],
                ] as const
              ).map(([label, acc, total, color]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[0.6875rem] font-mono uppercase tracking-wider ${color}`}>{label}</span>
                    <span className="text-xs font-mono text-cyber-muted">
                      {total}/{result.total_events} - {acc}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-cyber-surface-hover overflow-hidden">
                    <div className="h-full bg-cyber-surface-hover rounded-full" style={{ width: `${acc}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[0.75rem] text-cyber-text leading-snug mt-3">{result.insight}</p>
          </div>

          {/* Event-by-event breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyber-heading">
              Event by event
            </h3>
            {result.events.map(renderEventRow)}
          </div>
        </div>
      )}
    </div>
  );
}
