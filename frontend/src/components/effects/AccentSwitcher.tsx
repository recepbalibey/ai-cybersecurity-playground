"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Palette } from "lucide-react";

/**
 * Accent A/B switcher. Cycling the button steps through the curated accent
 * presets (cyan default, electric-blue, teal, violet) and applies each live
 * by setting html[data-accent]. Persists the choice to localStorage.
 */
const ACCENTS = ["cyan", "electric-blue", "teal", "violet"] as const;

const STORAGE_KEY = "cyber-accent";

export function AccentSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>("cyan");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ACCENTS.includes(saved as (typeof ACCENTS)[number])) {
        const next = saved as (typeof ACCENTS)[number];
        setAccent(next);
        document.documentElement.setAttribute("data-accent", next);
      }
    } catch {
      // private mode / storage unavailable — keep default cyan
    }
  }, []);

  const apply = useCallback((next: (typeof ACCENTS)[number]) => {
    setAccent(next);
    document.documentElement.setAttribute("data-accent", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — expression still applies for the session
    }
  }, []);

  const cycle = () => {
    const i = ACCENTS.indexOf(accent);
    apply(ACCENTS[(i + 1) % ACCENTS.length]);
  };

  if (collapsed) {
    return (
      <button
        onClick={cycle}
        title="Accent theme"
        aria-label="Cycle accent theme"
        className="rounded-md p-1.5 text-cyber-muted transition-colors hover:bg-cyber-surface-hover hover:text-accent"
      >
        <Palette className="h-4 w-4" strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-3.5 w-3.5 text-cyber-muted" strokeWidth={1.75} aria-hidden />
      <div className="flex items-center gap-1.5">
        {ACCENTS.map((a) => (
          <button
            key={a}
            onClick={() => apply(a)}
            title={a}
            aria-label={`Accent theme: ${a}`}
            className={`h-3.5 w-3.5 rounded-full border transition-all ${
              accent === a
                ? "scale-110 border-cyber-text/60 shadow-[0_0_8px_rgb(var(--cb-accent)/0.6)]"
                : "border-cyber-border-light hover:scale-110"
            }`}
            style={{
              background:
                a === "cyan"
                  ? "rgb(6 182 212)"
                  : a === "electric-blue"
                  ? "rgb(59 130 246)"
                  : a === "teal"
                  ? "rgb(20 184 166)"
                  : "rgb(139 92 246)",
            }}
          />
        ))}
      </div>
    </div>
  );
}