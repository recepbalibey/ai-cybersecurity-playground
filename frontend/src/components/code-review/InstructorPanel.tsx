"use client";

import React from "react";
import { GraduationCap, MessageCircleQuestion } from "lucide-react";

interface InstructorContext {
  teaching_points: { title: string; concept: string; explanation: string; key_takeaway: string }[];
  discussion_questions: string[];
}

const FALLBACK: InstructorContext = {
  teaching_points: [
    {
      title: "Code review is a security control",
      concept: "Review before deploy catches flaws early",
      explanation:
        "AI review widens coverage and finds patterns fast, but it cannot understand business context or intent. A human must validate severity, confirm real exploitability, and review each fix before code ships.",
      key_takeaway: "AI assists review; the human decides.",
    },
  ],
  discussion_questions: [
    "Which finding would you fix first and why?",
    "How would you verify that the proposed fix is secure?",
    "What could the AI have missed that a human reviewer would notice?",
  ],
};

export function InstructorPanel({ context }: { context?: InstructorContext }) {
  const ctx = context ?? FALLBACK;
  return (
    <div className="cyber-panel border border-cyan-500/40 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-accent" />
        <h3 className="text-xs font-bold text-cyber-text">Instructor Notes</h3>
      </div>

      <div className="space-y-3">
        {ctx.teaching_points.map((tp) => (
          <div key={tp.title} className="rounded-md border border-cyber-border bg-cyber-base/40 p-3">
            <div className="text-[0.75rem] font-bold text-cyber-text">{tp.title}</div>
            <div className="text-[0.6875rem] text-accent italic mt-0.5">{tp.concept}</div>
            <p className="text-[0.75rem] text-cyber-muted mt-1.5">{tp.explanation}</p>
            <div className="mt-2 text-[0.6875rem] text-status-success font-mono">Takeaway: {tp.key_takeaway}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-accent">
          <MessageCircleQuestion className="w-3.5 h-3.5" /> Discussion
        </div>
        <ul className="space-y-1.5">
          {ctx.discussion_questions.map((q, i) => (
            <li key={i} className="text-[0.75rem] text-cyber-muted flex gap-2">
              <span className="text-accent shrink-0">-</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}