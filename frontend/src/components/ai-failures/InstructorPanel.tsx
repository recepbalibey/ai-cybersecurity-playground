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
        <GraduationCap className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-cyber-heading">
          Teaching view - {failureName}
        </h3>
      </div>

      <div className="rounded-md border border-cyber-border bg-cyber-base/60 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-status-warning" />
          <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-status-warning">
            Learning objective
          </span>
        </div>
        <p className="text-[0.75rem] text-cyber-text leading-snug">{learningObjective}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-accent" />
          <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-cyber-muted">
            Teaching points
          </span>
        </div>
        <ul className="space-y-1.5">
          {teachingPoints.map((p, i) => (
            <li key={i} className="text-[0.75rem] text-cyber-muted leading-snug flex gap-2">
              <span className="text-accent font-mono">-</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <MessagesSquare className="w-3.5 h-3.5 text-accent" />
          <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-cyber-muted">
            Discussion questions
          </span>
        </div>
        <ul className="space-y-1.5">
          {discussionQuestions.map((p, i) => (
            <li key={i} className="text-[0.75rem] text-cyber-muted leading-snug flex gap-2">
              <span className="text-accent font-mono">-</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
