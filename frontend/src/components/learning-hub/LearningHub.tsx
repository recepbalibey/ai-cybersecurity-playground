import { useMemo, useState } from "react";
import {
  Compass,
  BookOpen,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Play,
} from "lucide-react";
import {
  THEORY_TOPICS,
  LEARNING_PATHS,
  LABS,
  LAB_LESSONS,
  suggestedLabsBy,
  type LearningPathId,
  type TheoryTopic,
  type LabsWalker,
  type LabLesson,
} from "@/services/learningHub";
import { cn } from "@/lib/cn";
import { TheoryFlow, FlowLegend } from "./TheoryFlow";
import { LabLessonModal } from "./LabLessonModal";
import { HoloTilt } from "@/components/effects/HoloTilt";
import { HoloMatrix } from "@/components/effects/HoloMatrix";
import { getLabBrief } from "@/data/labBriefData";

export interface LearningHubProps {
  progress: {
    total: number;
    completed: number;
    percent: number;
  };
  completedIds: string[];
  learningPath: LearningPathId | null;
  onSelectLab: (labId: string) => void;
  onOpenTheory: (topicId: string) => void;
  onChoosePath: (path: LearningPathId) => void;
  onExploreLabs: () => void;
  onResetProgress: () => void;
}

export function LearningHub({
  progress,
  completedIds,
  learningPath,
  onSelectLab,
  onOpenTheory,
  onChoosePath,
  onExploreLabs,
  onResetProgress,
}: LearningHubProps) {
  const [activeSection, setActiveSection] = useState<
    "overview" | "theory" | "labs"
  >("overview");
  const [theorTopic, setTheoryTopic] = useState<TheoryTopic>(THEORY_TOPICS[0]);

  const suggested = useMemo(
    () => suggestedLabsBy(learningPath, completedIds),
    [learningPath, completedIds]
  );
  const done = useMemo(() => new Set(completedIds), [completedIds]);

  const handleOpenTheoryTopic = (topic: TheoryTopic) => {
    setTheoryTopic(topic);
    setActiveSection("theory");
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-cyber-heading">Learning Hub</h2>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-cyber-muted">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>
              Completed {progress.completed}/{progress.total} labs
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-cyber-border">
              <div
                className="h-full rounded-full bg-emerald-400 progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
          {progress.completed > 0 && (
            <button
              onClick={onResetProgress}
              title="Reset all completed lab progress"
              className="flex items-center gap-1.5 rounded-md border border-cyber-border bg-cyber-surface px-2.5 py-1.5 text-xs text-cyber-muted transition-colors hover:border-rose-400/40 hover:text-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Reset progress
            </button>
          )}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: "overview", label: "Overview", icon: Compass },
            { id: "theory", label: "Theory Library", icon: BookOpen },
            { id: "labs", label: "Labs", icon: FlaskConical },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm",
              activeSection === id
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-transparent text-cyber-muted hover:bg-cyber-surface-hover hover:text-cyber-text"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {activeSection === "overview" && (
          <Overview
            learningPath={learningPath}
            onChoosePath={onChoosePath}
            onSelectLab={onSelectLab}
            onExploreLabs={onExploreLabs}
            onOpenTheoryTopic={handleOpenTheoryTopic}
            suggested={suggested}
            done={done}
          />
        )}
        {activeSection === "theory" && (
          <TheoryLibrary
            topic={theorTopic}
            onSelectTopic={setTheoryTopic}
            onOpenTheory={onOpenTheory}
          />
        )}
        {activeSection === "labs" && (
          <LabGrid onSelectLab={onSelectLab} done={done} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                           */
/* ------------------------------------------------------------------ */

function Overview({
  learningPath,
  onChoosePath,
  onSelectLab,
  onExploreLabs,
  onOpenTheoryTopic,
  suggested,
  done,
}: {
  learningPath: LearningPathId | null;
  onChoosePath: LearningHubProps["onChoosePath"];
  onSelectLab: LearningHubProps["onSelectLab"];
  onExploreLabs: LearningHubProps["onExploreLabs"];
  onOpenTheoryTopic: (t: TheoryTopic) => void;
  suggested: LabsWalker[];
  done: Set<string>;
}) {
  const next = suggested.find((l) => !done.has(l.id));
  const hasNext = next !== undefined && done.size > 0;
  return (
    <div className="space-y-6">
      <Hero learningPath={learningPath} onExploreLabs={onExploreLabs} />

      {hasNext && (
        <ContinueCard
          lab={next}
          completedCount={done.size}
          totalCount={LABS.length}
          learningPath={learningPath}
          onSelect={() => onSelectLab(next.id)}
        />
      )}

      {!learningPath && (
        <PathChoice onChoosePath={onChoosePath} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel">
            <SectionHeading
              icon={Sparkles}
              title="Big picture"
              subtitle="Two AI worlds, one shared discipline."
            />
            <BigPicture />
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-4">
            <SectionHeading
              icon={BookOpen}
              title="Start with theory"
              subtitle="Three concepts first."
            />
            <div className="space-y-2">
              {THEORY_TOPICS.slice(0, 3).map((t) => (
                <TheoryRow key={t.id} topic={t} onOpen={() => onOpenTheoryTopic(t)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue learning - full width at the bottom of the page */}
      <div className="panel">
        <SectionHeading
          icon={FlaskConical}
          title="Continue learning"
          subtitle="Labs that build on what you already explored."
        />
        <div className="space-y-3">
          {suggested.map((lab) => (
            <LabRow
              key={lab.id}
              lab={lab}
              completed={done.has(lab.id)}
              onSelect={() => onSelectLab(lab.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero({
  learningPath,
  onExploreLabs,
}: {
  learningPath: LearningPathId | null;
  onExploreLabs: () => void;
}) {
  return (
    <div className="panel holo-panel holo-border relative overflow-hidden p-8 radar-hover">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <HoloMatrix />
      </div>
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="holo-reticle relative space-y-4">
        <p className="font-mono text-xs uppercase tracking-wider text-cyber-muted">
          AI Cybersecurity Playground
        </p>
        <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-cyber-heading md:text-3xl">
          Explore how artificial intelligence changes cybersecurity - from
          defending systems with AI to securing AI itself.
        </h1>
        <p className="max-w-2xl text-base text-cyber-text">
          {LABS.length} hands-on labs let you defend with AI and attack AI. Pick a
          learning path and open the first lab.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExploreLabs}
            className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-cyber-base hover:bg-accent-hover"
          >
            Start Learning
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <span className="text-sm text-cyber-muted">
            {learningPath
              ? `Path: ${LEARNING_PATHS[learningPath].name}`
              : "Choose a learning path to personalize your start."}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Continue where you left off                                         */
/* ------------------------------------------------------------------ */

function ContinueCard({
  lab,
  completedCount,
  totalCount,
  learningPath,
  onSelect,
}: {
  lab: LabsWalker;
  completedCount: number;
  totalCount: number;
  learningPath: LearningPathId | null;
  onSelect: () => void;
}) {
  const percent = Math.round((completedCount / totalCount) * 100);
  return (
    <div className="panel holo-panel holo-border group relative overflow-hidden p-5 radar-hover">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
          <Play className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-wider text-cyber-muted">
              Continue where you left off
            </p>
            {learningPath && (
              <span className="rounded-full border border-cyber-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyber-muted">
                {LEARNING_PATHS[learningPath].name} path
              </span>
            )}
          </div>
          <p className="mt-1 text-base font-medium text-cyber-heading">{lab.title}</p>
          <p className="text-sm text-cyber-muted">{lab.module}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-cyber-muted">
            {completedCount}/{totalCount} labs completed
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-cyber-border">
              <div
                className="h-full rounded-full bg-emerald-400 progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={onSelect}
          className="group flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-cyber-base transition-colors hover:bg-accent-hover"
        >
          Continue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Path choice (onboarding)                                            */
/* ------------------------------------------------------------------ */

function PathChoice({
  onChoosePath,
}: {
  onChoosePath: (path: LearningPathId) => void;
}) {
  return (
    <div className="panel p-6">
      <SectionHeading
        icon={Compass}
        title="Choose your learning path"
        subtitle="This sets the order of the labs you see first. You can visit any lab anytime."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(LEARNING_PATHS) as LearningPathId[]).map((id) => {
          const p = LEARNING_PATHS[id];
          return (
            <HoloTilt
              key={id}
              className="group panel p-5"
              maxTilt={4}
            >
              <button
                onClick={() => onChoosePath(id)}
                className="flex w-full flex-col items-start gap-2 text-left"
              >
                <span className="flex items-center gap-2 font-medium text-cyber-heading">
                  {p.name}
                  <ArrowRight className="h-4 w-4 text-cyber-muted transition-colors group-hover:text-accent" />
                </span>
                <span className="text-sm text-cyber-muted">{p.tagline}</span>
                <span className="text-sm text-cyber-text">{p.description}</span>
              </button>
            </HoloTilt>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Big picture                                                         */
/* ------------------------------------------------------------------ */

function BigPicture() {
  const columns = [
    {
      title: "AI for Cybersecurity",
      color: "text-accent",
      points: [
        "Detect - AI SOC Analyst",
        "Hunt - AI Threat Hunting",
        "Assess - AI Pentest Assistant",
      ],
    },
    {
      title: "Cybersecurity of AI",
      color: "text-rose-400",
      points: [
        "Manipulate - Prompt Injection",
        "Bypass - Jailbreak Evaluator",
        "Fool - Adversarial ML",
        "Control - AI Agent Security",
      ],
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {columns.map((col) => (
        <HoloTilt
          key={col.title}
          className="group panel p-5"
          maxTilt={3}
        >
          <h4 className={cn("text-sm font-semibold", col.color)}>{col.title}</h4>
          <ul className="mt-3 space-y-2">
            {col.points.map((pt) => (
              <li key={pt} className="flex items-center gap-2 text-sm text-cyber-text">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyber-muted transition-colors group-hover:text-accent" />
                {pt}
              </li>
            ))}
          </ul>
        </HoloTilt>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Theory library                                                      */
/* ------------------------------------------------------------------ */

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
