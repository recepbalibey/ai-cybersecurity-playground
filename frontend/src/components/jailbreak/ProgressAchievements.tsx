"use client";

import React, { useEffect, useState } from "react";
import { Award, TrendingUp, BadgeCheck } from "lucide-react";

interface ProgressAchievementsProps {
  testsCompleted: number;
  blockedCount: number;
}

const TIERS = [
  { min: 0, title: "AI Red Team Beginner", icon: Award },
  { min: 3, title: "Prompt Analyst", icon: BadgeCheck },
  { min: 8, title: "Model Security Tester", icon: TrendingUp },
  { min: 15, title: "AI Safety Evaluator", icon: Award },
];

export function ProgressAchievements({
  testsCompleted,
  blockedCount,
}: ProgressAchievementsProps) {
  const current = TIERS.reduce((acc, t) => (testsCompleted >= t.min ? t : acc), TIERS[0]);
  const next = TIERS.find((t) => t.min > testsCompleted);
  const progress = next ? Math.min(100, (testsCompleted / next.min) * 100) : 100;
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const prev = testsCompleted - 1;
    const justUnlocked = TIERS.some((t) => t.min === testsCompleted);
    if (justUnlocked && prev >= 0) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 2200);
      return () => clearTimeout(t);
    }
  }, [testsCompleted]);

  const CurrentIcon = current.icon;

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden relative">
      {celebrate && (
        <div className="absolute inset-0 z-10 bg-cyan-500/10 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="text-center">
            <Award className="w-10 h-10 text-cyan-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-cyan-200 uppercase tracking-wider font-mono">
              Rank Unlocked
            </p>
          </div>
        </div>
      )}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold text-cyber-heading uppercase tracking-wider font-mono">
            Progress & Achievements
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyber-muted uppercase">
          {testsCompleted} tests
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Current rank */}
        <div className="md:col-span-5 p-4 rounded-lg border border-slate-800 bg-slate-950/70 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <CurrentIcon className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-cyber-muted uppercase mb-1">Current Rank</div>
            <div className="text-base font-bold text-cyber-heading">{current.title}</div>
            <div className="mt-2 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-cyber-muted mt-1">
              {next ? `${testsCompleted}/${next.min} toward ${next.title}` : "Max rank reached"}
            </div>
          </div>
        </div>

        {/* Stats + tiers */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Tests Completed</div>
            <div className="text-2xl font-bold font-mono text-cyber-heading">{testsCompleted}</div>
          </div>
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Attacks Blocked</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{blockedCount}</div>
          </div>
          <div className="col-span-2 p-3 rounded-lg border border-slate-800 bg-slate-950/70">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Rank Progression</div>
            <div className="flex items-center gap-2 flex-wrap">
              {TIERS.map((t) => {
                const Icon = t.icon;
                const unlocked = testsCompleted >= t.min;
                return (
                  <div
                    key={t.title}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-mono ${
                      unlocked
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.title}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}