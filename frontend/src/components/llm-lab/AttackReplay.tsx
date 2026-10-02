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
          <History className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
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
          className="px-3 h-8 rounded-md bg-cyan-600 hover:bg-cyan-500 text-on-accent text-[0.6875rem] font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-cyan-glow"
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
          className="px-3 h-8 rounded-md bg-cyber-surface-hover hover:bg-cyber-surface-hover text-cyber-text text-[0.6875rem] font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={clear}
          disabled={history.length === 0}
          className="px-3 h-8 rounded-md bg-status-danger/10 hover:bg-status-danger/10 border border-red-500/40 text-status-danger text-[0.6875rem] font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Playback Visualization of blocks */}
      <div className="p-4 flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-8">
            <Terminal className="w-10 h-10 text-cyber-muted mb-3" />
            <p className="text-sm text-cyber-muted">No attacks recorded yet.</p>
            <p className="text-xs text-cyber-muted mt-1">
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
                    ? "bg-accent/10 border-cyan-500/50 shadow-cyan-glow"
                    : "bg-cyber-base/60 border-cyber-border hover:border-cyber-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.625rem] font-mono text-cyber-muted">
                    {entry.timestamp}
                  </span>
                  <span
                    className={`ml-auto text-[0.625rem] font-mono px-1.5 py-0.5 rounded font-bold ${
                      entry.status === "SUCCESS"
                        ? "bg-status-danger/10 text-status-danger border border-red-500/40"
                        : "bg-status-success/10 text-status-success border border-emerald-500/40"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="text-[0.6875rem] text-cyber-text font-mono break-all">
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