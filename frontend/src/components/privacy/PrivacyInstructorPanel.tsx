"use client";

import React from "react";
import { GraduationCap, Lightbulb, MessageSquareText } from "lucide-react";
import type { InstructorContext } from "@/services/privacyScanner";

export function PrivacyInstructorPanel({ context }: { context: InstructorContext }) {
  return (
    <div className="cyber-panel border border-cyan-500/30 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyan-500/30 bg-cyan-500/5 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-cyber-heading">Instructor</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          {context.teaching_points.map((p, i) => (
            <div key={i} className="rounded-md border border-cyber-border bg-cyber-base/40 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-status-warning shrink-0" />
                <span className="text-[0.75rem] font-semibold text-cyber-heading">{p.title}</span>
              </div>
              <p className="text-[0.6875rem] text-cyber-muted leading-snug mb-1">
                <span className="text-accent font-mono">{p.concept}</span> - {p.explanation}
              </p>
              <p className="text-[0.6875rem] text-status-success leading-snug">Key takeaway: {p.key_takeaway}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareText className="w-3.5 h-3.5 text-accent" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-cyber-heading">Classroom discussion</span>
          </div>
          <ul className="space-y-1.5">
            {context.discussion_questions.map((q, i) => (
              <li key={i} className="text-[0.75rem] text-cyber-muted leading-snug flex gap-2">
                <span className="text-accent font-mono">Q{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
