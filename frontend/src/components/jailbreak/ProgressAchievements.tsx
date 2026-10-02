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
            <Award className="w-10 h-10 text-accent mx-auto mb-1" />
            <p className="text-sm font-bold text-cyber-text uppercase tracking-wider font-mono">
              Rank Unlocked
            </p>
          </div>
        </div>
      )}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Progress & Achievements
          </h2>
        </div>
        <span className="text-[0.6875rem] font-mono text-cyber-muted uppercase">
          {testsCompleted} tests
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Current rank */}
        <div className="md:col-span-5 p-4 rounded-lg border border-cyber-border bg-cyber-base/70 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <CurrentIcon className="w-7 h-7 text-accent" />
          </div>
          <div>
            <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-1">Current Rank</div>
            <div className="text-base font-bold text-cyber-heading">{current.title}</div>
            <div className="mt-2 h-1.5 w-full bg-cyber-base rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[0.625rem] font-mono text-cyber-muted mt-1">
              {next ? `${testsCompleted}/${next.min} toward ${next.title}` : "Max rank reached"}
            </div>
          </div>
        </div>

        {/* Stats + tiers */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-cyber-border bg-cyber-base/70">
            <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-1">Tests Completed</div>
            <div className="text-2xl font-bold font-mono text-cyber-heading">{testsCompleted}</div>
          </div>
          <div className="p-3 rounded-lg border border-cyber-border bg-cyber-base/70">
            <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-1">Attacks Blocked</div>
            <div className="text-2xl font-bold font-mono text-status-success">{blockedCount}</div>
          </div>
          <div className="col-span-2 p-3 rounded-lg border border-cyber-border bg-cyber-base/70">
            <div className="text-[0.625rem] font-mono text-cyber-muted uppercase mb-2">Rank Progression</div>
            <div className="flex items-center gap-2 flex-wrap">
              {TIERS.map((t) => {
                const Icon = t.icon;
                const unlocked = testsCompleted >= t.min;
                return (
                  <div
                    key={t.title}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[0.625rem] font-mono ${
                      unlocked
                        ? "bg-accent/10 border-cyan-500/50 text-accent"
                        : "bg-cyber-base border-cyber-border text-cyber-muted"
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