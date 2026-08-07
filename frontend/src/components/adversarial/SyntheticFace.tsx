"use client";

import React from "react";

export type AttackOverlay = "none" | "noise" | "occlusion" | "transformation";

const FACES: Record<string, { skin: string; hair: string; eye: string; lip: string; glasses: boolean; earring: boolean; hairStyle: "short" | "long" | "buzz" }> = {
  alpha: { skin: "#d9a879", hair: "#2b2b33", eye: "#3b6ea5", lip: "#b5606a", glasses: false, earring: false, hairStyle: "short" },
  beta: { skin: "#c68a63", hair: "#4a2c1a", eye: "#5a4030", lip: "#a0505c", glasses: true, earring: true, hairStyle: "long" },
  gamma: { skin: "#e3b98f", hair: "#14161c", eye: "#2f4f3f", lip: "#c06a74", glasses: false, earring: false, hairStyle: "buzz" },
};

function NoiseGrid({ seed = 7 }: { seed?: number }) {
  const cells = [];
  const rnd = (i: number) => (Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
  for (let i = 0; i < 24; i++) {
    const r = rnd(i) * 255;
    const g = rnd(i + 40) * 255;
    const b = rnd(i + 80) * 255;
    cells.push(
      <rect
        key={i}
        x={(i % 6) * 24}
        y={Math.floor(i / 6) * 24}
        width={24}
        height={24}
        fill={`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},0.18)`}
      />
    );
  }
  return <g>{cells}</g>;
}

interface SyntheticFaceProps {
  subject: string;
  overlay?: AttackOverlay;
  size?: number;
  className?: string;
}

export function SyntheticFace({ subject, overlay = "none", size = 180, className }: SyntheticFaceProps) {
  const f = FACES[subject] ?? FACES.alpha;
  const headClip = <clipPath id={`face-clip-${subject}-${overlay}`}><ellipse cx="90" cy="92" rx="52" ry="64" /></clipPath>;

  return (
    <svg
      viewBox="0 0 180 180"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Synthetic rendering of ${subject}`}
    >
      <defs>{headClip}</defs>

      {/* hair */}
      {f.hairStyle === "short" && <path d="M38 80 Q40 34 90 30 Q140 34 142 80 Q148 58 134 48 Q120 38 90 36 Q58 38 46 48 Q32 58 38 80 Z" fill={f.hair} />}
      {f.hairStyle === "buzz" && <path d="M40 74 Q44 40 90 36 Q136 40 140 74 Q142 60 130 52 Q112 40 90 40 Q68 40 50 52 Q38 60 40 74 Z" fill={f.hair} />}
      {f.hairStyle === "long" && <path d="M38 84 Q36 44 90 34 Q144 44 142 84 L148 170 Q130 152 124 120 Q120 168 96 172 Q72 168 58 120 Q52 152 34 170 Z" fill={f.hair} />}

      {/* ears */}
      <ellipse cx="36" cy="100" rx="9" ry="16" fill={f.skin} />
      <ellipse cx="144" cy="100" rx="9" ry="16" fill={f.skin} />
      {f.earring && <circle cx="34" cy="120" r="4" fill="#d4af37" />}

      {/* head */}
      <g clipPath={`url(#face-clip-${subject}-${overlay})`}>
        <ellipse cx="90" cy="92" rx="52" ry="64" fill={f.skin} />
        <ellipse cx="60" cy="60" rx="22" ry="14" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="118" cy="52" rx="20" ry="12" fill="rgba(255,255,255,0.12)" />
      </g>

      {/* brows + eyes */}
      <path d="M58 82 Q70 76 82 82" stroke={f.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M98 82 Q110 76 122 82" stroke={f.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="70" cy="92" rx="8" ry="6" fill="#ffffff" />
      <ellipse cx="110" cy="92" rx="8" ry="6" fill="#ffffff" />
      <circle cx="70" cy="92" r="4" fill={f.eye} />
      <circle cx="110" cy="92" r="4" fill={f.eye} />
      <circle cx="70" cy="92" r="1.6" fill="#0a0a0a" />
      <circle cx="110" cy="92" r="1.6" fill="#0a0a0a" />

      {/* glasses */}
      {f.glasses && (
        <g stroke="#1a1d26" strokeWidth="3" fill="none">
          <rect x="56" y="84" width="28" height="18" rx="5" />
          <rect x="96" y="84" width="28" height="18" rx="5" />
          <path d="M84 93 H96" />
        </g>
      )}

      {/* nose + lips */}
      <path d="M90 94 Q84 106 90 112 Q96 106 90 94 Z" fill="rgba(0,0,0,0.12)" />
      <path d="M74 126 Q90 134 106 126 Q96 138 90 138 Q84 138 74 126 Z" fill={f.lip} />
      <path d="M74 126 Q90 132 106 126" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none" />

      {/* neck + shoulders */}
      <path d="M76 150 L76 180 L104 180 L104 150 Z" fill={f.skin} />
      <path d="M40 168 Q60 148 90 150 Q120 148 140 168 L150 180 L30 180 Z" fill="#1f2733" />

      {/* attack overlays */}
      {overlay === "noise" && <NoiseGrid />}
      {overlay === "occlusion" && (
        <g>
          <rect x="58" y="78" width="64" height="30" rx="4" fill="#0b0e14" opacity="0.92" />
          <rect x="58" y="78" width="64" height="30" rx="4" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" />
        </g>
      )}
      {overlay === "transformation" && (
        <g>
          <rect x="0" y="0" width="180" height="180" fill="#7dd3fc" opacity="0.28" />
          <rect x="0" y="0" width="180" height="180" fill="none" stroke="#38bdf8" strokeWidth="2" />
        </g>
      )}

      {/* scanline highlight */}
      <line x1="18" y1="40" x2="162" y2="40" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
    </svg>
  );
}

export function predictionLabel(subject: string): string {
  const names: Record<string, string> = { alpha: "Subject Alpha", beta: "Subject Beta", gamma: "Subject Gamma" };
  return names[subject] ?? subject;
}
