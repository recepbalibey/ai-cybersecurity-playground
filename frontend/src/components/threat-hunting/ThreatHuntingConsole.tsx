"use client";

import React, { useState } from "react";
import { Search, Sparkles, Terminal, Shield, Zap } from "lucide-react";

interface ThreatHuntingConsoleProps {
  onSearch: (query: string) => void;
  isHunting: boolean;
}

export function ThreatHuntingConsole({
  onSearch,
  isHunting,
}: ThreatHuntingConsoleProps) {
  const [queryInput, setQueryInput] = useState(
    "Detect obfuscated PowerShell script execution and credential dumping attempts"
  );

  const presets = [
    {
      label: "Detect PowerShell Abuse",
      query: "Detect obfuscated PowerShell script execution and credential dumping attempts",
      icon: Terminal,
    },
    {
      label: "Find Brute Force Attacks",
      query: "Search for high-volume SSH and RDP authentication surges",
      icon: Shield,
    },
    {
      label: "Search Lateral Movement",
      query: "Look for possible internal SMB admin share lateral movement and PsExec execution",
      icon: Zap,
    },
    {
      label: "Detect Data Exfiltration",
      query: "Detect local archive staging in Temp directory and high-volume outbound data transfer",
      icon: Search,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onSearch(queryInput.trim());
    }
  };

  return (
    <div className="cyber-panel corner-frame border border-cyber-border p-6 rounded-lg space-y-4">
      {/* Console Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Search className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-cyber-heading uppercase tracking-wider font-mono">
            Threat Hunting Console
          </h2>
        </div>
        <span className="text-xs font-mono text-cyber-muted">
          Proactive AI Query Engine
        </span>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="What threat do you want to hunt? (e.g. Find suspicious PowerShell or SMB lateral movement)"
            className="w-full h-14 pl-12 pr-36 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-cyber-heading placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-4" />

          <button
            type="submit"
            disabled={isHunting || !queryInput.trim()}
            className={`absolute right-2 top-2 h-10 px-5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              isHunting || !queryInput.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-glow cursor-pointer"
            }`}
          >
            {isHunting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Hunting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Launch Hunt</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Buttons */}
      <div>
        <div className="text-xs font-mono text-cyber-muted uppercase mb-2">
          Predefined Threat Hunting Scenarios
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presets.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setQueryInput(preset.query);
                  onSearch(preset.query);
                }}
                className="px-3.5 py-2.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-md text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span className="text-xs font-semibold text-cyber-text group-hover:text-cyan-300">
                    {preset.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
