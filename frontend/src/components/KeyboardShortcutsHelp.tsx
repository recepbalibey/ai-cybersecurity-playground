"use client";

import { useEffect } from "react";
import {
  Keyboard,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { LABS } from "@/services/learningHub";
import { useOverlaySignal } from "@/lib/overlayActivity";

const SHORTCUTS: { keys: string[]; desc: string }[] = [
  { keys: ["⌘K"], desc: "Open command palette (Ctrl on Windows/Linux)" },
  { keys: ["→"], desc: "Next lab (ArrowDown works too)" },
  { keys: ["←"], desc: "Previous lab (ArrowUp works too)" },
  { keys: ["1", "9"], desc: "Jump to lab by its number (0 = lab 10)" },
  { keys: ["?"], desc: "Open / close this shortcut help" },
  { keys: ["Esc"], desc: "Close brief, modal, or palette" },
];

function Key({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-cyber-border bg-cyber-surface-hover px-1.5 font-mono text-[11px] font-medium text-cyber-heading">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({
  open,
  onClose,
  completedIds,
}: {
  open: boolean;
  onClose: () => void;
  completedIds: string[];
}) {
  useOverlaySignal(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if ((ev.key === "Escape" || ev.key === "?") && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const done = new Set(completedIds);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-base/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-cyber-border bg-cyber-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cyber-border bg-cyber-surface-hover/60 p-5">
          <div className="flex items-start gap-3">
            <Keyboard className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-cyber-muted">
                Command Center
              </p>
              <h3 className="text-lg font-semibold text-cyber-heading">Keyboard shortcuts</h3>
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

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyber-heading">
              Navigation
            </p>
            <ul className="space-y-2">
              {SHORTCUTS.map((s) => (
                <li key={s.desc} className="flex items-center justify-between gap-3 text-sm text-cyber-text">
                  <span>{s.desc}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-cyber-muted">or</span>}
                        <Key>{k}</Key>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyber-heading">
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
              Lab jump numbers
              <span className="text-[10px] font-mono normal-case text-cyber-muted">
                press 1-9 or 0 to go straight to a lab
              </span>
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {LABS.map((lab) => (
                <div
                  key={lab.id}
                  className="flex items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface/40 px-3 py-1.5 text-sm"
                >
                  <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-1.5 font-mono text-[11px] font-medium text-accent">
                    {lab.order}
                  </kbd>
                  <span className="truncate text-cyber-text">{lab.title}</span>
                  {done.has(lab.id) && (
                    <span className="ml-auto text-[10px] font-mono text-emerald-400">done</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-cyber-border bg-cyber-surface-hover/40 p-4">
          <p className="flex items-center gap-2 text-xs text-cyber-muted">
            <ArrowLeft className="h-3.5 w-3.5" />
            <ArrowRight className="h-3.5 w-3.5" />
            Arrow keys cycle the labs in sideview order.
          </p>
          <button
            onClick={onClose}
            className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-cyber-base transition-colors hover:bg-accent-hover"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}