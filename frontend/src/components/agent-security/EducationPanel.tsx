"use client";

import React, { useState } from "react";
import { BookOpen, ShieldAlert, Award, Activity } from "lucide-react";
import { MissionResult } from "@/services/agentSecurity";

interface EducationPanelProps {
  principles: { key: string; name: string; summary: string; details: string; good_practice: string }[];
  riskFactors: { key: string; name: string; severity: string; description: string; why_dangerous: string; control: string }[];
  result: MissionResult | null;
  totalMissions: number;
}

type Tab = "points" | "risks" | "principles" | "timeline";

export function EducationPanel({ principles, riskFactors, result, totalMissions }: EducationPanelProps) {
  const [tab, setTab] = useState<Tab>("points");

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "points", label: "Lesson", icon: BookOpen },
    { id: "risks", label: "Risks", icon: ShieldAlert },
    { id: "principles", label: "Principles", icon: BookOpen },
    { id: "timeline", label: "Timeline", icon: Activity },
  ];

  const missions = result?.events ?? [];

  return (
    <div className="cyber-panel border border-cyber-border p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <BookOpen className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Mission Intelligence
        </h3>
        <span className="ml-auto text-[10px] font-mono text-cyber-muted">
          {totalMissions} mission{totalMissions === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex gap-1.5 mb-3">
        {["Learning", "Risks", "Principles", "Timeline"].map((label, idx) => {
          const id = tabs[idx].id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 px-1 py-1.5 rounded text-[9px] font-semibold uppercase tracking-wide transition-all ${
                tab === id ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-950/60 text-slate-400 border border-slate-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5">
        {tab === "points" && (
          <>
            {(result?.teaching_points ?? []).map((p, i) => (
              <div key={i} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">{p.concept}</span>
                </div>
                <div className="text-xs font-bold text-cyber-heading mb-1">{p.title}</div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">{p.explanation}</p>
                <p className="text-[11px] text-amber-300/90 mt-2 font-mono">→ {p.key_takeaway}</p>
              </div>
            ))}
            {(result?.teaching_points ?? []).length === 0 && (
              <p className="text-[11px] font-mono text-cyber-muted py-6 text-center">
                Run a mission to unlock its teaching points.
              </p>
            )}
          </>
        )}

        {tab === "risks" &&
          riskFactors.map((r) => (
            <div key={r.key} className="p-3 bg-slate-950/60 border border-slate-800 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300">{r.name}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  r.severity === "Critical" ? "border-rose-500 text-rose-400" : r.severity === "High" ? "border-orange-500 text-orange-400" : "border-amber-500 text-amber-400"
                }`}>{r.severity}</span>
              </div>
              <p className="text-[11px] text-cyber-muted mt-1.5">{r.description}</p>
              <p className="text-[10px] text-amber-400/80 mt-1.5 font-mono">Risk: {r.why_dangerous}</p>
              <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">Control: {r.control}</p>
            </div>
          ))}

        {tab === "principles" &&
          principles.map((p) => (
            <div key={p.key} className="p-3 bg-slate-950/60 border border-slate-800 rounded-md">
              <div className="text-xs font-bold text-cyber-heading mb-1">{p.name}</div>
              <div className="text-[10px] text-cyan-300/90 font-mono mb-1.5">{p.summary}</div>
              <p className="text-[11px] text-cyber-muted leading-relaxed">{p.details}</p>
              <p className="text-[11px] text-emerald-300/80 mt-2 font-mono">✓ {p.good_practice}</p>
            </div>
          ))}

        {tab === "timeline" && (
          <>
            {missions.length === 0 && (
              <p className="text-[11px] font-mono text-cyber-muted py-6 text-center">
                No mission executed yet.
              </p>
            )}
            {(result?.graph ?? []).map((n, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    n.status === "blocked" ? "bg-rose-500" : n.status === "flagged" ? "bg-amber-500" : "bg-cyan-500"
                  }`}
                />
                <span className="text-[11px] font-mono text-cyber-text w-32 shrink-0">{n.label}</span>
                <span className="text-[10px] font-mono text-cyber-muted truncate">{n.detail}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}