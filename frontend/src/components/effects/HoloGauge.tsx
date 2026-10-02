"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";

export type GaugeTone = "accent" | "emerald" | "amber" | "rose";

const TONE_RGB: Record<GaugeTone, string> = {
  accent: "var(--cb-accent)",
  emerald: "16 185 129",
  amber: "245 158 11",
  rose: "244 63 94",
};

interface HoloGaugeProps {
  /** Value on a 0..max scale (default max 100). */
  value: number;
  max?: number;
  /** Short label shown under the ring (e.g. "AI Confidence"). */
  label: string;
  /** Education-sized explanation shown when hovered. */
  note?: string;
  sublabel?: string;
  tone?: GaugeTone;
  /** Round the percentage to a whole integer when true. */
  integer?: boolean;
  className?: string;
}

export function HoloGauge({
  value,
  max = 100,
  label,
  note,
  sublabel,
  tone = "accent",
  integer,
  className,
}: HoloGaugeProps) {
  const shown = Math.max(0, Math.min(max, value));
  const [focused, setFocused] = useState(false);

  const pct = max === 0 ? 0 : Math.min(100, (shown / max) * 100);
  const renderNum = integer ? String(Math.round(pct)) : pct.toFixed(1);
  const rgb = TONE_RGB[tone];

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div
      className={cn("holo-gauge", className)}
      onPointerEnter={() => setFocused(true)}
      onPointerLeave={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ "--gauge-rgb": rgb } as React.CSSProperties}
      tabIndex={note ? 0 : undefined}
      role="meter"
      aria-valuenow={Math.round(shown)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className="holo-gauge-ring">

        <span className="holo-gauge-num">
          {renderNum}
          <em>%</em>
        </span>
      </div>
      <span className="holo-gauge-label">{label}</span>
      {sublabel && <span className="holo-gauge-sub">{sublabel}</span>}
      {note && (
        <span className={cn("holo-gauge-note", focused && "is-on")}>
          <i aria-hidden />
          {note}
        </span>
      )}
      <svg viewBox="0 0 120 120" className="holo-gauge-track" aria-hidden>
        <circle className="holo-gauge-arc-bg" cx="60" cy="60" r={radius} />
        <circle
          className="holo-gauge-arc"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
    </div>
  );
}