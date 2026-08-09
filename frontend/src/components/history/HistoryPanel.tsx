"use client";

import React, { useEffect, useRef, useState } from "react";
import { History, FileWarning } from "lucide-react";

export type BadgeTone = "rose" | "amber" | "yellow" | "emerald" | "neutral";

export interface HistoryRow {
  id: number;
  label: string;
  meta?: string;
  badge?: string;
  badgeTone?: BadgeTone;
}

const BADGE_TONE: Record<BadgeTone, string> = {
  rose: "text-rose-300 border-rose-500/40",
  amber: "text-amber-300 border-amber-500/40",
  yellow: "text-yellow-300 border-yellow-500/40",
  emerald: "text-emerald-300 border-emerald-500/40",
  neutral: "text-slate-300 border-slate-600",
};

const toneFor = (value: string | undefined): BadgeTone => {
  const v = (value ?? "").toLowerCase();
  if (v === "critical" || v === "high") return "rose";
  if (v === "medium") return "amber";
  if (v === "low" || v === "informational") return "emerald";
  return "neutral";
};

interface HistoryPanelProps {
  title?: string;
  fetchRows: () => Promise<HistoryRow[]>;
  loadingText?: string;
  emptyText?: string;
  /** Bump to force a refresh (e.g. after a new review is created). */
  refreshKey?: number;
}

export function HistoryPanel({
  title = "Recent History",
  fetchRows,
  loadingText = "Loading history…",
  emptyText = "Run an analysis to populate history",
  refreshKey = 0,
}: HistoryPanelProps) {
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const fetchRef = useRef(fetchRows);
  fetchRef.current = fetchRows;

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    fetchRef.current().then((list) => {
      if (!cancelled) setRows(list);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">{title}</h3>
      </div>

      {rows === null ? (
        <div className="text-[12px] text-cyber-muted animate-pulse">{loadingText}</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 text-slate-600 py-3">
          <FileWarning className="w-5 h-5 opacity-50" />
          <span className="text-[12px]">{emptyText}</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 flex items-center justify-between gap-2 hover:border-cyan-500/40 transition-all"
            >
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-cyber-text truncate">{row.label}</div>
                {row.meta && <div className="text-[11px] font-mono text-slate-500">{row.meta}</div>}
              </div>
              {row.badge && (
                <span
                  className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded border ${
                    BADGE_TONE[row.badgeTone ?? toneFor(row.badge)] ?? BADGE_TONE.neutral
                  }`}
                >
                  {row.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}