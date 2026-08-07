"use client";

import React from "react";
import { GraduationCap, Lightbulb, MessagesSquare } from "lucide-react";

interface InstructorPanelProps {
  teachingPoints: string[];
  discussionQuestions: string[];
  learningObjective: string;
  failureName: string;
}

export function InstructorPanel({
  teachingPoints,
  discussionQuestions,
  learningObjective,
  failureName,
}: InstructorPanelProps) {
  return (
    <div className="cyber-panel border border-cyan-500/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Teaching view - {failureName}
        </h3>
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
            Learning objective
          </span>
        </div>
        <p className="text-[12px] text-cyber-text leading-snug">{learningObjective}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyber-muted">
            Teaching points
          </span>
        </div>
        <ul className="space-y-1.5">
          {teachingPoints.map((p, i) => (
            <li key={i} className="text-[12px] text-cyber-muted leading-snug flex gap-2">
              <span className="text-cyan-400 font-mono">-</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <MessagesSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyber-muted">
            Discussion questions
          </span>
        </div>
        <ul className="space-y-1.5">
          {discussionQuestions.map((p, i) => (
            <li key={i} className="text-[12px] text-cyber-muted leading-snug flex gap-2">
              <span className="text-cyan-400 font-mono">-</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
