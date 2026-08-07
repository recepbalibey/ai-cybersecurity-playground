"use client";

import React from "react";
import {
  ShieldAlert,
  Search,
  Terminal,
  Cpu,
  Lock,
  Zap,
  Bot,
} from "lucide-react";

interface NavigationProps {
  activeModule: string;
  onSelectModule?: (moduleId: string) => void;
}

export function Navigation({ activeModule, onSelectModule }: NavigationProps) {
  const modules = [
    {
      id: "soc-analyst",
      name: "AI SOC Analyst",
      icon: ShieldAlert,
      active: true,
      badge: "LIVE DEMO",
    },
    {
      id: "threat-hunting",
      name: "AI Threat Hunting",
      icon: Search,
      active: true,
      badge: "LIVE DEMO",
    },
    {
      id: "pentest-assistant",
      name: "AI Pentest Assistant",
      icon: Terminal,
      active: true,
      badge: "LIVE DEMO",
    },
    {
      id: "prompt-injection",
      name: "Prompt Injection Lab",
      icon: Zap,
      active: true,
      badge: "LIVE DEMO",
    },
    {
      id: "jailbreak-lab",
      name: "Jailbreak Lab",
      icon: Lock,
      active: true,
      badge: "LIVE DEMO",
    },
    {
      id: "adversarial-ml",
      name: "Adversarial ML Lab",
      icon: Cpu,
      active: true,
      badge: "LIVE DEMO",
    },
    {
      id: "agent-security",
      name: "AI Agent Security Lab",
      icon: Bot,
      active: true,
      badge: "LIVE DEMO",
    },
  ];

  return (
    <aside className="w-64 bg-cyber-surface border-r border-cyber-border flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-cyber-border flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-cyber-heading uppercase">
            AI Cybersecurity
          </h1>
          <p className="text-xs text-cyber-muted tracking-widest font-mono">
            PLAYGROUND v1.0
          </p>
        </div>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-mono tracking-widest text-cyber-muted uppercase">
          Defense Operations
        </div>

        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = mod.id === activeModule;
          return (
            <button
              key={mod.id}
              disabled={!mod.active}
              onClick={() => onSelectModule && onSelectModule(mod.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 shadow-cyan-glow cursor-pointer"
                  : mod.active
                  ? "text-cyber-text hover:bg-cyber-surface-hover hover:text-white cursor-pointer"
                  : "text-cyber-muted/60 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-cyan-400" : "text-cyber-muted"
                  }`}
                />
                <span>{mod.name}</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-slate-900 text-slate-500 border border-slate-800"
                }`}
              >
                {mod.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-cyber-border bg-cyber-base/50">
        <div className="flex items-center justify-between text-xs font-mono text-cyber-muted">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYS_OK
          </span>
          <span>SOC_NODE_01</span>
        </div>
      </div>
    </aside>
  );
}
