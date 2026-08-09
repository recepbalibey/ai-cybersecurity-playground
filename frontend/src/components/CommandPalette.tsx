"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Command,
  X,
  CheckCircle2,
  Sun,
  Moon,
  Keyboard,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { LABS, THEORY_TOPICS } from "@/services/learningHub";
import { useOverlaySignal } from "@/lib/overlayActivity";

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  keywords: string;
  action: () => void;
  done?: boolean;
}

function scoreItem(query: string, label: string, keywords: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const hay = `${label} ${keywords}`.toLowerCase();
  if (hay === q) return 1000;
  if (hay.startsWith(q)) return 900 - label.length;
  if (hay.includes(q)) return 500 - label.length;
  let qi = 0;
  for (let i = 0; i < hay.length && qi < q.length; i++) {
    if (hay[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 200 - label.length;
  return 0;
}

export function CommandPalette({
  open,
  onClose,
  onToggle,
  onNavigate,
  onOpenTheory,
  onToggleTheme,
  theme,
  onToggleShortcuts,
  completedIds,
}: {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNavigate: (labId: string) => void;
  onOpenTheory: (topicId: string) => void;
  onToggleTheme: () => void;
  theme: "dark" | "light";
  onToggleShortcuts: () => void;
  completedIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = useMemo(() => new Set(completedIds), [completedIds]);
  useOverlaySignal(open);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIdx(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Global Cmd/Ctrl+K toggles the palette; Esc closes it. Registered even when
  // closed so the shortcut always works (useKeyboardNav skips meta/ctrl combos).
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "k" && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        onToggle();
        return;
      }
      if (open && ev.key === "Escape") {
        ev.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onToggle]);

  const targets: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];
    for (const lab of LABS) {
      list.push({
        id: lab.id,
        label: lab.title,
        hint: `${lab.module}${done.has(lab.id) ? " · completed" : ""}`,
        icon: <FlaskConical className="h-4 w-4 shrink-0" strokeWidth={1.75} />,
        keywords: `${lab.module} ${lab.blurb} ${lab.learned}`,
        action: () => onNavigate(lab.id),
        done: done.has(lab.id),
      });
    }
    for (const topic of THEORY_TOPICS) {
      list.push({
        id: `theory-${topic.id}`,
        label: topic.title,
        hint: "Theory topic",
        icon: <BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.75} />,
        keywords: `${topic.blurb} ${topic.dark} ${topic.lab} theory concept reading`,
        action: () => {
          onOpenTheory(topic.id);
        },
      });
    }
    return list;
  }, [done, onNavigate, onOpenTheory]);

  const actions: PaletteItem[] = [
    {
      id: "toggle-theme",
      label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      hint: "Command",
      icon:
        theme === "dark" ? (
          <Sun className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        ) : (
          <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        ),
      keywords: "theme dark light mode appearance toggle switch",
      action: onToggleTheme,
    },
    {
      id: "shortcuts",
      label: "Keyboard shortcuts",
      hint: "Command",
      icon: <Keyboard className="h-4 w-4 shrink-0" strokeWidth={1.75} />,
      keywords: "shortcuts keys help keyboard shortcuts",
      action: () => {
        onClose();
        onToggleShortcuts();
      },
    },
  ];

  // Order: matched labs/theory first (by score), then actions. Empty query
  // shows all targets, no actions (keeps the palette a navigator by default).
  const results = useMemo(() => {
    const q = query.trim();
    const scored = targets
      .map((t) => ({ t, s: q ? scoreItem(q, t.label, t.keywords) : 1 }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || targets.indexOf(a.t) - targets.indexOf(b.t))
      .map((r) => r.t);
    if (!q) return [...scored, ...actions];
    return [...scored, ...actions.filter((a) => scoreItem(q, a.label, a.keywords) > 0)];
  }, [targets, actions, query]);

  useEffect(() => {
    setActiveIdx((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  const run = (item: PaletteItem) => {
    onClose();
    item.action();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-cyber-base/70 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-cyber-border bg-cyber-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-cyber-border px-4">
          <Search className="h-4 w-4 shrink-0 text-cyber-muted" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % Math.max(1, results.length));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((i) => (i - 1 + results.length) % Math.max(1, results.length));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const item = results[activeIdx];
                if (item) run(item);
              }
            }}
            placeholder="Search labs, theory, or commands…"
            className="h-14 w-full bg-transparent font-mono text-sm text-cyber-heading placeholder:font-mono placeholder:text-cyber-muted outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
          />
          <span className="flex items-center gap-1 rounded border border-cyber-border px-1.5 py-1 font-mono text-[10px] text-cyber-muted">
            <Command className="h-3 w-3" strokeWidth={1.75} /> K
          </span>
          <button
            onClick={onClose}
            aria-label="Close command palette"
            className="ml-1 rounded-md p-1 text-cyber-muted transition-colors hover:text-rose-400"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div id="command-palette-list" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-cyber-muted">
              No results for “{query}”
            </div>
          )}
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => run(item)}
              onMouseMove={() => setActiveIdx(i)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                i === activeIdx ? "bg-accent/15" : "hover:bg-cyber-surface-hover"
              }`}
            >
              <span className={i === activeIdx ? "text-accent" : "text-cyber-muted"}>{item.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-cyber-heading">{item.label}</span>
                <span className="block truncate font-mono text-[11px] text-cyber-muted">{item.hint}</span>
              </span>
              {item.done && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.75} />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-cyber-border bg-cyber-surface-hover/40 px-4 py-2.5 font-mono text-[10px] text-cyber-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-cyber-border bg-cyber-surface px-1">↑</kbd>
            <kbd className="rounded border border-cyber-border bg-cyber-surface px-1">↓</kbd>
            <span>navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-cyber-border bg-cyber-surface px-1">↵</kbd>
            <span>select</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-cyber-border bg-cyber-surface px-1">esc</kbd>
            <span>close</span>
          </span>
          <span className="ml-auto hidden sm:block">⌘K to reopen</span>
        </div>
      </div>
    </div>
  );
}