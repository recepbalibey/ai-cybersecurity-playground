"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CircleHelp, BookOpen } from "lucide-react";
import { THEORY_TOPICS } from "@/services/learningHub";
import { cn } from "@/lib/cn";

interface ConceptChipProps {
  /** Term shown in the text. */
  label: string;
  /** Optional override for which THEORY_TOPICS entry to open. */
  topicId?: string;
  /** Callback when the student clicks "open theory". */
  onOpenTheory?: (topicId: string) => void;
  className?: string;
}

interface BubblePosition {
  top: number;
  left: number;
  up: boolean;
}

export function ConceptChip({
  label,
  topicId,
  onOpenTheory,
  className,
}: ConceptChipProps) {
  const topic =
    THEORY_TOPICS.find((t) => t.id === topicId) ??
    THEORY_TOPICS.find((t) =>
      t.title.toLowerCase().includes(label.toLowerCase())
    );

  const btnRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<BubblePosition | null>(null);

  const updatePosition = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const gap = 8;
    const bubbleW = 288;
    let left = r.left;
    if (left + bubbleW > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - bubbleW - 12);
    }
    const below = r.bottom + gap + 220;
    const up = below > window.innerHeight - 12;
    setPos({
      left,
      up,
      top: up ? r.top - gap : r.bottom + gap,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        bubbleRef.current &&
        !bubbleRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!topic) {
    return <span className={cn("text-inherit", className)}>{label}</span>;
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          updatePosition();
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-1 rounded-sm border-b border-dashed border-accent/50 text-accent transition-colors hover:border-accent hover:text-cyan-200",
          className
        )}
      >
        {label}
        <CircleHelp className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={bubbleRef}
            role="dialog"
            aria-label={`${topic.title} - quick reference`}
            className="fixed z-50 w-[16rem] rounded-lg border border-cyber-border bg-cyber-surface p-3 shadow-2xl animate-fade-in"
            style={{ left: pos.left, top: pos.top }}
          >
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
              {topic.title}
            </span>
            <span className="block text-[12px] leading-relaxed text-cyber-text">
              {topic.blurb}
            </span>
            <span className="mt-2 block rounded-md bg-cyber-surface-hover/60 px-2.5 py-1.5 text-[11px] text-cyber-text">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                The catch:
              </span>
              {topic.dark}
            </span>
            {onOpenTheory && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenTheory(topic.id);
                }}
                className="mt-2.5 flex h-7 items-center gap-1.5 rounded-md border border-accent/40 px-2.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10"
              >
                <BookOpen className="h-3 w-3" strokeWidth={1.75} />
                Open full theory
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}