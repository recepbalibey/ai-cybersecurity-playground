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
    <div className="p-5 bg-accent/10 border border-cyan-500/40 rounded-lg shadow-cyan-glow space-y-4 relative mb-6 corner-frame">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold text-accent">
            Instructor Mode: Master&apos;s Level Teaching Points
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-cyber-muted hover:text-white p-1 rounded hover:bg-cyber-surface-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Teaching Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teachingPoints.map((tp, idx) => (
          <div
            key={idx}
            className="chip-holo p-4 bg-cyber-base/80 border border-cyber-border rounded flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-accent mb-1.5">
                <Lightbulb className="w-4 h-4 text-status-warning shrink-0" />
                <span>{tp.title}</span>
              </div>
              <div className="text-xs font-mono text-accent mb-2">
                Concept: {tp.concept}
              </div>
              <p className="text-xs text-cyber-text leading-relaxed mb-3">
                {tp.explanation}
              </p>
            </div>
            <div className="p-2.5 bg-cyber-base border border-cyber-border rounded text-xs text-status-success font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
              <span>{tp.key_takeaway}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
