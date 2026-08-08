"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

interface LabBriefButtonProps {
  labId: string;
  open?: boolean;
  onToggle: () => void;
  className?: string;
}

export function LabBriefButton({ labId, open, onToggle, className }: LabBriefButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`Lab brief for ${labId}`}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors",
        open
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-cyber-border text-cyber-muted hover:border-cyber-border-light hover:text-cyber-text",
        className
      )}
    >
      <BookOpen className="h-4 w-4" strokeWidth={1.75} />
      Lab Brief
    </button>
  );
}
