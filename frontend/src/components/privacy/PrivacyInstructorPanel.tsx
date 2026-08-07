"use client";

import React from "react";
import { GraduationCap, Lightbulb, MessageSquareText } from "lucide-react";
import type { InstructorContext } from "@/services/privacyScanner";

export function PrivacyInstructorPanel({ context }: { context: InstructorContext }) {
  return (
    <div className="cyber-panel border border-cyan-500/30 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyan-500/30 bg-cyan-500/5 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">Instructor</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          {context.teaching_points.map((p, i) => (
            <div key={i} className="rounded-md border border-cyber-border bg-slate-900/40 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[12px] font-semibold text-cyber-heading">{p.title}</span>
              </div>
              <p className="text-[11px] text-cyber-muted leading-snug mb-1">
                <span className="text-cyan-300/90 font-mono">{p.concept}</span> - {p.explanation}
              </p>
              <p className="text-[11px] text-emerald-300/90 leading-snug">Key takeaway: {p.key_takeaway}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyber-heading">Classroom discussion</span>
          </div>
          <ul className="space-y-1.5">
            {context.discussion_questions.map((q, i) => (
              <li key={i} className="text-[12px] text-cyber-muted leading-snug flex gap-2">
                <span className="text-cyan-400 font-mono">Q{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
