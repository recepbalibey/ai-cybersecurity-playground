"use client";

import { useEffect } from "react";

const LAB_ORDER = [
  "soc-analyst",
  "threat-hunting",
  "pentest-assistant",
  "prompt-injection",
  "jailbreak-lab",
  "adversarial-ml",
  "agent-security",
  "malware-analysis",
  "code-review",
  "privacy-lab",
  "governance",
  "ai-failure-lab",
];

interface UseKeyboardNavOptions {
  /** module currently shown (string of the active one) */
  activeModule: string;
  /** when true, arrow nav is suspended (e.g. brief open, typing) handled separately */
  disabled?: boolean;
  onNavigate: (moduleId: string) => void;
  /** called when '?' or Shift+/ pressed */
  onToggleHelp: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardNav({
  activeModule,
  disabled = false,
  onNavigate,
  onToggleHelp,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (disabled) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (isTypingTarget(ev.target)) return;

      const idx = LAB_ORDER.indexOf(activeModule);

      if (ev.key === "ArrowDown" || ev.key === "ArrowRight") {
        ev.preventDefault();
        const next = LAB_ORDER[(idx + 1 + LAB_ORDER.length) % LAB_ORDER.length];
        onNavigate(next);
        return;
      }
      if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        const prev = LAB_ORDER[(idx - 1 + LAB_ORDER.length) % LAB_ORDER.length];
        onNavigate(prev);
        return;
      }

      // Number keys 1-9 and 0 (=> 10) map to the lab order. "1"/"2" pair handling:
      // typing '1','2' in quick succession jumps to 12. We only support single
      // keystrokes here: 1-9 -> labs 1-9, 0 -> lab 10. Jumping to 11/12 uses
      // arrows. (Kept simple to avoid swallowing numeric input in editors.)
      if (/^[0-9]$/.test(ev.key)) {
        const lab = LAB_ORDER[ev.key === "0" ? 9 : parseInt(ev.key, 10) - 1];
        if (lab) {
          ev.preventDefault();
          onNavigate(lab);
        }
        return;
      }

      if (ev.key === "?" || (ev.shiftKey && ev.key === "/")) {
        ev.preventDefault();
        onToggleHelp();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeModule, disabled, onNavigate, onToggleHelp]);
}