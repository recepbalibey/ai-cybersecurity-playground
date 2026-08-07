"use client";

import React from "react";
import { BookOpen, Lightbulb, ShieldCheck, X } from "lucide-react";
import { TeachingPoint } from "@/services/aiAnalyst";

interface TeachingOverlayProps {
  teachingPoints: TeachingPoint[];
  onClose: () => void;
}

export function TeachingOverlay({
  teachingPoints,
  onClose,
}: TeachingOverlayProps) {
  return (
    <div className="p-5 bg-cyan-950/30 border border-cyan-500/40 rounded-lg shadow-cyan-glow space-y-4 relative mb-6">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-widest font-mono">
            Instructor Mode: Master&apos;s Level Teaching Points
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Teaching Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teachingPoints.map((tp, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-950/80 border border-slate-800 rounded flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300 mb-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{tp.title}</span>
              </div>
              <div className="text-xs font-mono text-cyan-400/80 mb-2">
                Concept: {tp.concept}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {tp.explanation}
              </p>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-emerald-400 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{tp.key_takeaway}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
