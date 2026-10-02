"use client";

import { useMemo, useState } from "react";
import { BookOpen, FlaskConical, CheckCircle2, ArrowRight, RotateCcw, ShieldCheck, ScanLine, Clock3 } from "lucide-react";
import { THEORY_TOPICS, LEARNING_PATHS, LABS, LAB_LESSONS, suggestedLabsBy, type LearningPathId, type TheoryTopic, type LabsWalker, type LabLesson } from "@/services/learningHub";
import { cn } from "@/lib/cn";
import { TheoryFlow, FlowLegend } from "./TheoryFlow";
import { LabLessonModal } from "./LabLessonModal";
import { HoloTilt } from "@/components/effects/HoloTilt";
import { getLabBrief } from "@/data/labBriefData";

export interface LearningHubProps {
  progress: { total: number; completed: number; percent: number };
  completedIds: string[];
  learningPath: LearningPathId | null;
  onSelectLab: (labId: string) => void;
  onOpenTheory: (topicId: string) => void;
  onChoosePath: (path: LearningPathId) => void;
  onExploreLabs: () => void;
  onResetProgress: () => void;
}

export function LearningHub({ progress, completedIds, learningPath, onSelectLab, onOpenTheory, onChoosePath, onResetProgress }: LearningHubProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "theory" | "labs">("overview");
  const [theoryTopic, setTheoryTopic] = useState<TheoryTopic>(THEORY_TOPICS[0]);
  const suggested = useMemo(() => suggestedLabsBy(learningPath, completedIds), [learningPath, completedIds]);
  const done = useMemo(() => new Set(completedIds), [completedIds]);
  const next = suggested.find(lab => !done.has(lab.id)) ?? LABS[0];
  return (
    <div className="learning-home">
      <div className="hub-toolbar">
        <div className="hub-tabs" role="tablist" aria-label="Learning resources">
          {([{ id: "overview", label: "Start here" }, { id: "labs", label: "All labs" }, { id: "theory", label: "Theory" }] as const).map(({ id, label }) => (
            <button key={id} id={`tab-${id}`} role="tab" aria-selected={activeSection === id} aria-controls="hub-content" onClick={() => setActiveSection(id)} className={activeSection === id ? "is-active" : ""}>{label}</button>
          ))}
        </div>
        <div className="hub-progress">
          <span>{progress.completed} of {progress.total} labs complete</span>
          <progress value={progress.completed} max={progress.total} aria-label="Completed labs" />
          {progress.completed > 0 && <button onClick={onResetProgress} title="Reset progress" aria-label="Reset progress"><RotateCcw size={16} strokeWidth={1.75} /></button>}
        </div>
      </div>
      <div id="hub-content" role="tabpanel" aria-labelledby={`tab-${activeSection}`}>
        {activeSection === "overview" && <div className="space-y-10">
          <section className="home-hero">
            <div className="hero-copy">
              <p className="eyebrow">Learn by doing</p>
              <h1>Understand AI.<br />Practice security.</h1>
              <p className="hero-description">Investigate threats with AI. Learn how AI systems fail and how to protect them. Work through {LABS.length} hands-on labs, one step at a time.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => onSelectLab(next.id)}>{done.size > 0 ? "Continue learning" : "Start your first lab"}<ArrowRight size={16} strokeWidth={1.75} /></button>
                <button className="text-button" onClick={() => setActiveSection("labs")}>Browse all labs</button>
              </div>
              <p className="hero-note">Simulated scenarios. No live targets. Progress saved on this device.</p>
            </div>
            <div className="first-lab">
              <div className="flex items-center justify-between"><span className="eyebrow">{done.size > 0 ? "Up next" : "A good place to start"}</span><ScanLine size={20} strokeWidth={1.75} /></div>
              <h2>{next.title}</h2>
              <p>{next.blurb}</p>
              <ol className="lab-steps">
                <li><span>1</span>Choose a sample scenario</li>
                <li><span>2</span>Run the analysis</li>
                <li><span>3</span>Review the evidence and decide</li>
              </ol>
              <div className="first-lab-meta"><Clock3 size={16} strokeWidth={1.75} />{getLabBrief(next.id)?.estimatedTime ?? "Self-paced"}<span>Guided lab</span></div>
            </div>
          </section>
          <section>
            <div className="section-title"><div><h2>Choose a direction</h2><p>Set your lab order. You can switch paths or open any lab.</p></div></div>
            <div className="path-grid">
              {(Object.keys(LEARNING_PATHS) as LearningPathId[]).map(id => <button key={id} className={`path-card ${learningPath === id ? "selected" : ""}`} aria-pressed={learningPath === id} onClick={() => onChoosePath(id)}>
                <div className="path-icon">{id === "ai-for-cyber" ? <ScanLine size={22} strokeWidth={1.75} /> : <ShieldCheck size={22} strokeWidth={1.75} />}</div>
                <div><h3>{id === "ai-for-cyber" ? "Defend with AI" : "Secure AI systems"}</h3><p>{id === "ai-for-cyber" ? "Read security logs, hunt threats, and review code with AI assistance." : "Test prompt injection, agent permissions, privacy, and model safety."}</p><span className="path-link">{learningPath === id ? "Selected path" : "Choose this path"}<ArrowRight size={16} strokeWidth={1.75} /></span></div>
              </button>)}
            </div>
          </section>
          <section>
            <div className="section-title"><div><h2>{learningPath ? "Your next labs" : "Explore the labs"}</h2><p>Choose a topic and put it into practice.</p></div><button className="text-button" onClick={() => setActiveSection("labs")}>View all {LABS.length}<ArrowRight size={16} /></button></div>
            <div className="recommended-labs">{suggested.slice(0, 3).map(lab => <LabRow key={lab.id} lab={lab} completed={done.has(lab.id)} onSelect={() => onSelectLab(lab.id)} />)}</div>
          </section>
          <section className="theory-strip"><BookOpen size={20} strokeWidth={1.75} /><div><h2>New to AI?</h2><p>Read the short lessons before trying a lab.</p></div><button className="text-button" onClick={() => setActiveSection("theory")}>Read the theory<ArrowRight size={16} /></button></section>
        </div>}
        {activeSection === "labs" && <div className="space-y-6"><div className="section-title"><div><h1 className="text-2xl font-semibold text-cyber-heading">All labs</h1><p>Open a lab or read its lesson first.</p></div></div><LabGrid onSelectLab={onSelectLab} done={done} /></div>}
        {activeSection === "theory" && <TheoryLibrary topic={theoryTopic} onSelectTopic={setTheoryTopic} onOpenTheory={onOpenTheory} />}
      </div>
      <footer className="home-footer"><span>AI Cybersecurity Playground</span><span>A practice space for students and teachers.</span></footer>
    </div>
  );
}

function TheoryLibrary({
  topic,
  onSelectTopic,
  onOpenTheory,
}: {
  topic: TheoryTopic;
  onSelectTopic: (t: TheoryTopic) => void;
  onOpenTheory: (topicId: string) => void;
}) {
  const selected = topic;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <div className="panel h-fit p-4 lg:sticky lg:top-0">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-cyber-muted">
          Concepts
        </p>
        <div className="space-y-1">
          {THEORY_TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTopic(t)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
                selected.id === t.id
                  ? "bg-accent/10 text-accent"
                  : "text-cyber-text hover:bg-cyber-surface-hover"
              )}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Lesson header */}
        <div className="panel holo-panel p-6">
          <h3 className="text-lg font-semibold text-cyber-heading">
            {selected.title}
          </h3>
          <p className="mt-2 text-cyber-text">{selected.blurb}</p>
          <div className="mt-4 rounded-lg border border-cyber-border bg-cyber-surface/60 p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-cyber-muted">
              The catch
            </p>
            <p className="mt-1 text-sm text-cyber-text">{selected.dark}</p>
          </div>
        </div>

        {/* Schematic */}
        <div className="panel holo-panel p-6">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider text-cyber-muted">
            How it works
          </p>
          <TheoryFlow nodes={selected.flow.nodes} edges={selected.flow.edges} />
          <div className="mt-4">
            <FlowLegend />
          </div>
        </div>

        {/* Teaching text */}
        <div className="panel holo-panel space-y-5 p-6">
          {selected.sections.map((s) => (
            <div key={s.title}>
              <h4 className="font-medium text-cyber-heading">{s.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-cyber-text">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Takeaways */}
        <div className="panel holo-panel p-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-cyber-muted">
            Key takeaways
          </p>
          <ul className="space-y-2">
            {selected.takeaways.map((t, idx) => (
              <li
                key={t}
                style={{ animationDelay: `${idx * 90}ms` }}
                className="decode-enter flex items-start gap-2 text-sm text-cyber-text"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-cyber-muted">
            Try it in the lab:{" "}
            <span className="text-cyber-text">{selected.lab}</span>
          </p>
          <button
            onClick={() => onOpenTheory(selected.id)}
            className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-cyber-base hover:bg-accent-hover"
          >
            Open {selected.title}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lab grid                                                            */
/* ------------------------------------------------------------------ */

function LabGrid({
  onSelectLab,
  done,
}: {
  onSelectLab: (labId: string) => void;
  done: Set<string>;
}) {
  const [openLesson, setOpenLesson] = useState<LabLesson | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LABS.map((lab) => {
          const brief = getLabBrief(lab.id);
          return (
        <HoloTilt
          key={lab.id}
          className="panel flex flex-col gap-3 p-5"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-cyber-muted">{lab.module}</span>
            {done.has(lab.id) ? (
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            ) : (
              <span className="rounded-full border border-cyber-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                Lab {lab.order}
              </span>
            )}
          </div>
          <h4 className="font-medium text-cyber-heading">{lab.title}</h4>
          <p className="text-sm text-cyber-muted">{lab.blurb}</p>
          {brief && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-cyber-muted">
              <span className="rounded border border-cyber-border px-1.5 py-0.5">
                {brief.difficulty}
              </span>
              <span className="rounded border border-cyber-border px-1.5 py-0.5">
                {brief.estimatedTime}
              </span>
              <span className="truncate rounded border border-cyber-border px-1.5 py-0.5">
                {brief.skills.join(" · ")}
              </span>
            </div>
          )}
          <p className="text-xs text-cyber-text/70">
            <span className="font-medium text-cyber-muted">You'll learn: </span>
            {lab.learned}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectLab(lab.id)}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-accent/40 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              Open lab
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setOpenLesson(LAB_LESSONS[lab.id])}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-cyber-border px-3 text-sm font-medium text-cyber-text transition-colors hover:border-accent/40 hover:text-accent"
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.75} />
              Understand the lab
            </button>
          </div>
        </HoloTilt>
          );
        })}
      </div>

      {openLesson && (
        <LabLessonModal
          lesson={openLesson}
          onClose={() => setOpenLesson(null)}
          onOpenLab={() => {
            setOpenLesson(null);
            onSelectLab(openLesson.id);
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared small pieces                                                 */
/* ------------------------------------------------------------------ */

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof BookOpen;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-accent" strokeWidth={1.75} />
      <div>
        <h3 className="text-sm font-semibold text-cyber-heading">{title}</h3>
        {subtitle && <p className="text-sm text-cyber-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

function LabRow({
  lab,
  completed,
  onSelect,
}: {
  lab: LabsWalker;
  completed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group hover-lift flex w-full items-center justify-between gap-3 rounded-lg border border-cyber-border bg-cyber-surface/40 px-4 py-3 text-left transition-colors hover:border-accent/40 hover:bg-cyber-surface"
    >
      <div className="flex items-center gap-3">
        {completed ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <span className="h-4 w-4 rounded-full border border-cyber-border" />
        )}
        <div>
          <p className="text-sm font-medium text-cyber-text">{lab.title}</p>
          <p className="text-xs text-cyber-muted">{lab.module}</p>
        </div>
      </div>
      <ArrowRight className="slide-arrow h-4 w-4 shrink-0 text-cyber-muted" />
    </button>
  );
}

function TheoryRow({
  topic,
  onOpen,
}: {
  topic: TheoryTopic;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="group hover-lift flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-cyber-surface-hover"
    >
      <BookOpen className="h-4 w-4 shrink-0 text-cyber-muted" />
      <span className="hover-text-glow text-sm text-cyber-text">{topic.title}</span>
    </button>
  );
}
