"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  ListChecks,
  X,
} from "lucide-react";
import type { LabLesson } from "@/services/learningHub";
import { useOverlaySignal } from "@/lib/overlayActivity";

export function LabLessonModal({
  lesson,
  onClose,
  onOpenLab,
}: {
  lesson: LabLesson;
  onClose: () => void;
  onOpenLab: () => void;
}) {
  useOverlaySignal(true);

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-base/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Understand the lab: ${lesson.title}`}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-cyber-border bg-cyber-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-cyber-border bg-cyber-surface-hover/60 p-5">
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-cyber-muted">
                Understand the lab
              </p>
              <h3 className="text-lg font-semibold text-cyber-heading">{lesson.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md border border-cyber-border p-1.5 text-cyber-muted transition-colors hover:border-rose-400/40 hover:text-rose-400"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <p className="text-sm leading-relaxed text-cyber-text">{lesson.teaser}</p>

          <section>
            <SectionTitle icon={ListChecks} title="What you will do" />
            <ol className="space-y-2">
              {lesson.what_you_do.map((step, i) => (
                <li
                  key={i}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="decode-enter flex items-start gap-2.5 text-sm text-cyber-text"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-[10px] font-medium text-accent">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionTitle icon={Lightbulb} title="Concepts to know" />
            <ul className="space-y-2">
              {lesson.concepts.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-cyber-text">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle icon={GraduationCap} title="What you take away" />
            <ul className="space-y-2">
              {lesson.takeaways.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-cyber-text">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.75} />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <SectionTitle icon={AlertTriangle} title="Watch out" tone="amber" />
            <ul className="space-y-1.5">
              {lesson.not_secrets.map((n) => (
                <li key={n} className="flex items-start gap-2.5 text-sm text-cyber-text">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {n}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-cyber-border bg-cyber-surface-hover/40 p-4">
          <p className="text-xs text-cyber-muted">
            Ready? The lab is waiting.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-10 rounded-md border border-cyber-border px-4 text-sm font-medium text-cyber-text transition-colors hover:bg-cyber-surface-hover"
            >
              Close
            </button>
            <button
              onClick={onOpenLab}
              className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-cyber-base transition-colors hover:bg-accent-hover"
            >
              Open lab
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  tone = "accent",
}: {
  icon: typeof Lightbulb;
  title: string;
  tone?: "accent" | "amber";
}) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyber-heading">
      <Icon
        className={tone === "amber" ? "text-amber-400" : "text-accent"}
        strokeWidth={1.75}
      />
      {title}
    </p>
  );
}