"use client";

import React, { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { THEORY_TOPICS } from "@/services/learningHub";
import { cn } from "@/lib/cn";

interface HoloTermProps {
  /** The word shown in the text. */
  term: string;
  /** Optional THEORY_TOPICS id to pull the definition from. */
  topicId?: string;
  /** Optional ad-hoc definition that overrides the topic lookup. */
  definition?: string;
  /** When a topicId is resolved, show an "open theory" link. */
  onOpenTheory?: (topicId: string) => void;
  className?: string;
}

/**
 * A student-facing holographic glossary term. Hovering reveals a floating
 * definition bubble (portal-mounted, so it never affects layout). Safe for
 * SSR: it only renders under the pointer, and `prefers-reduced-motion`
 * keeps the animation off.
 */
export function HoloTerm({
  term,
  topicId,
  definition,
  onOpenTheory,
  className,
}: HoloTermProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);

  const topic = topicId
    ? THEORY_TOPICS.find((t) => t.id === topicId)
    : undefined;

  const computePos = useCallback((r: DOMRect) => {
    const width = 300;
    const gap = 8;
    let left = r.left;
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12);
    }
    const below = r.bottom + gap + 60;
    const up = below > window.innerHeight - 12;
    return {
      left,
      top: up ? r.top - gap : r.bottom + gap,
      up,
    };
  }, []);

  const onEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setPos(computePos(el.getBoundingClientRect()));
    setOpen(true);
  }, [computePos]);

  const onLeave = useCallback(() => setOpen(false), []);

  const title = topic?.title ?? "In this lab";
  const body = definition ?? topic?.blurb ?? "Detailed explanation available in the theory library.";
  const essence = definition ? undefined : topic?.dark;

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        tabIndex={0}
        className={cn("holo-term", className)}
      >
        {term}
      </span>
      {open &&
        pos &&
        createPortal(
          <div
            role="tooltip"
            aria-label={`${term}: ${body}`}
            className="gloss-pop p-3.5"
            style={{ top: pos.top, left: pos.left }}
          >
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
              {topic ? `Concept: ${title}` : title}
            </span>
            <span className="block text-[12px] leading-relaxed text-cyber-text">
              {body}
            </span>
            {essence && (
              <span className="mt-2 block rounded-md bg-cyber-surface-hover/60 px-2.5 py-1.5 text-[11px] text-cyber-text">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                  The catch:
                </span>
                {essence}
              </span>
            )}
            {topic && onOpenTheory && (
              <button
                type="button"
                onClick={() => onOpenTheory(topic.id)}
                className="mt-2.5 flex h-7 items-center gap-1.5 rounded-md border border-accent/40 px-2.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10"
              >
                Open full theory
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}