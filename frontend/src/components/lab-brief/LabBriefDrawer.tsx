"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  CircleHelp,
  Target,
  Gauge,
  Clock,
  Layers,
  CheckCircle,
  X,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { getLabBrief, type LabBrief } from "@/data/labBriefData";
import { THEORY_TOPICS } from "@/services/learningHub";
import { useLabBrief } from "./LabBriefContext";
import { cn } from "@/lib/cn";

function TheoryPreview({ topicId, label }: { topicId: string; label: string }) {
  const topic = THEORY_TOPICS.find((t) => t.id === topicId);
  const [open, setOpen] = useState(false);
  if (!topic) return null;

  return (
    <div className="border border-cyber-border rounded-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] font-medium text-cyber-text hover:text-accent transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-cyber-muted transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-cyber-border">
          <p className="pt-2 text-[12px] text-cyber-text">{topic.blurb}</p>
          <div className="rounded-md bg-cyber-surface-hover/60 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
              The catch
            </p>
            <p className="text-[12px] text-cyber-text">{topic.dark}</p>
          </div>
          <ul className="space-y-1 pt-1">
            {topic.takeaways.slice(0, 3).map((t) => (
              <li key={t} className="flex items-start gap-2 text-[12px] text-cyber-muted">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={1.75} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  index,
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  index: string;
  icon: typeof GraduationCap;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-cyber-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-1 py-3 text-left"
      >
        <span className="font-mono text-[10px] text-cyber-muted tracking-wider">{index}</span>
        <Icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
        <span className="text-[12px] font-semibold text-cyber-heading uppercase tracking-wider">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-3.5 w-3.5 text-cyber-muted transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={1.75}
        />
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function MetadataRow({ brief }: { brief: LabBrief }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-cyber-border pt-3 mt-4">
      <span className="flex items-center gap-1.5 text-[11px] text-cyber-muted">
        <Gauge className="h-3.5 w-3.5" strokeWidth={1.75} />
        {brief.difficulty}
      </span>
      <span className="flex items-center gap-1.5 text-[11px] text-cyber-muted">
        <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
        {brief.estimatedTime}
      </span>
      <span className="flex items-center gap-1.5 text-[11px] text-cyber-muted">
        <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
        {brief.skills.join(" · ")}
      </span>
    </div>
  );
}

export function LabBriefDrawer() {
  const { openLabId, closeBrief, markStarted, startedLabs } = useLabBrief();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(false);

  const brief = openLabId ? getLabBrief(openLabId) : null;
  const started = brief ? startedLabs.has(brief.id) : false;

  /* focus the panel when opened */
  useEffect(() => {
    if (openLabId && !prevOpen.current) {
      const t = window.setTimeout(() => panelRef.current?.focus(), 30);
      prevOpen.current = true;
      return () => window.clearTimeout(t);
    }
    if (!openLabId) prevOpen.current = false;
  }, [openLabId]);

  /* Escape closes */
  useEffect(() => {
    if (!openLabId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBrief();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLabId, closeBrief]);

  /* lock body scroll while open */
  useEffect(() => {
    if (!openLabId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [openLabId]);

  if (!brief) return null;

  const handleStart = () => {
    markStarted(brief.id);
    closeBrief();
  };

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close lab brief"
        onClick={closeBrief}
        className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[2px] cursor-default"
      />
      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-brief-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-[420px] flex-col border-l border-cyber-border bg-cyber-surface shadow-2xl outline-none animate-brief-in max-sm:inset-x-0 max-sm:max-w-none max-sm:inset-y-auto max-sm:top-auto max-sm:bottom-0 max-sm:h-[92dvh] max-sm:rounded-t-lg"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-cyber-border px-5 py-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
              Lab Brief
            </p>
            <h2 id="lab-brief-title" className="text-base font-bold text-cyber-heading">
              {brief.title}
            </h2>
            <p className="text-[13px] text-cyber-muted">{brief.description}</p>
          </div>
          <button
            type="button"
            onClick={closeBrief}
            aria-label="Close lab brief"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-cyber-border text-cyber-muted transition-colors hover:border-cyber-border-light hover:text-cyber-text"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 01 - what you will learn (collapsed by default) */}
          <CollapsibleSection index="01" icon={GraduationCap} title="What you will learn">
            <ul className="space-y-2 pl-1">
              {brief.learningObjectives.map((o) => (
                <li key={o} className="flex items-start gap-2 text-[13px] text-cyber-text">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.75} />
                  {o}
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* 02 - what you need to know (collapsed by default) */}
          <CollapsibleSection index="02" icon={CircleHelp} title="What you need to know">
            <ul className="space-y-1.5 pl-1">
              {brief.prerequisites.map((p) => (
                <li key={p} className="flex items-start gap-2 text-[13px] text-cyber-text">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyber-muted" />
                  {p}
                </li>
              ))}
            </ul>
            {brief.theoryLinks.length > 0 && (
              <div className="pt-1 space-y-2">
                {brief.theoryLinks.map((l) => (
                  <TheoryPreview key={l.topicId} topicId={l.topicId} label={l.label} />
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* 03 - your mission (always visible) */}
          <div className="rounded-lg border border-cyber-border bg-cyber-surface-hover/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-cyber-muted tracking-wider">03</span>
              <Target className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <h3 className="text-[12px] font-bold text-cyber-heading uppercase tracking-wider">
                Your Mission
              </h3>
            </div>
            <p className="text-[13px] leading-relaxed text-cyber-text">{brief.mission}</p>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                Mission objectives
              </p>
              <ul className="space-y-1.5">
                {brief.missionObjectives.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-[13px] text-cyber-text">
                    <span className="mt-0.5 block h-3.5 w-3.5 shrink-0 rounded border border-cyber-border-light" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-cyber-border px-5 py-4 space-y-3">
          <MetadataRow brief={brief} />
          <button
            type="button"
            onClick={handleStart}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-cyber-base transition-colors hover:bg-accent-hover"
          >
            {started ? "Continue Mission" : "Start Mission"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
