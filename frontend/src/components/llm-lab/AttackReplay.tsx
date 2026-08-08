"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  History,
  Terminal,
} from "lucide-react";
import { LabMode } from "@/services/llmSecuritySimulator";

export interface ReplayEntry {
  id: string;
  timestamp: string;
  payload: string;
  mode: LabMode;
  status: "SUCCESS" | "BLOCKED" | "CLEAN";
}

interface AttackReplayProps {
  history: ReplayEntry[];
  onClear: () => void;
  onReplay: (entry: ReplayEntry) => void;
}

export function AttackReplay({
  history,
  onClear,
  onReplay,
}: AttackReplayProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    if (history.length === 0) return;
    if (currentIndex >= history.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((c) => c + 1);
    }
    setIsPlaying(true);
  };

  const pause = () => setIsPlaying(false);

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
  };

  const clear = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    onClear();
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (currentIndex >= history.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentIndex((c) => {
        const next = Math.min(c + 1, history.length - 1);
        return next;
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, [isPlaying, currentIndex, history.length]);

  const current = history[currentIndex];

  // Re-run the currently highlighted attack so the visual replay drives a
  // real execution (flush on every advance).
  useEffect(() => {
    if (currentIndex >= 0 && current) {
      onReplay(current);
    }
  }, [currentIndex]);

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Attack Replay
          </h2>
        </div>
        <span className="text-xs font-mono text-cyber-muted">
          {history.length} attacks
        </span>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-cyber-border flex items-center gap-1.5">
        <button
          onClick={isPlaying ? pause : play}
          disabled={history.length === 0}
          className="px-3 h-8 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-cyan-glow"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Replay
            </>
          )}
        </button>
        <button
          onClick={reset}
          disabled={currentIndex < 0}
          aria-label="Reset replay"
          title="Reset replay"
          className="px-3 h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={clear}
          disabled={history.length === 0}
          className="px-3 h-8 rounded-md bg-red-950/60 hover:bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Playback Visualization of blocks */}
      <div className="p-4 flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-8">
            <Terminal className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No attacks recorded yet.</p>
            <p className="text-xs text-slate-600 mt-1">
              Run an attack to log it here.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {history.map((entry, idx) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                }}
                className={`w-full text-left p-2.5 rounded-lg border cursor-pointer transition-all ${
                  idx === currentIndex
                    ? "bg-cyan-950/30 border-cyan-500/50 shadow-cyan-glow"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    {entry.timestamp}
                  </span>
                  <span
                    className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      entry.status === "SUCCESS"
                        ? "bg-red-950/60 text-red-400 border border-red-500/40"
                        : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono break-all">
                  {entry.payload}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}