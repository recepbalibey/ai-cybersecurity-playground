"use client";

import React from "react";
import {
  ShieldAlert,
  Search,
  Terminal,
  Zap,
  Lock,
  Cpu,
  Bot,
  Bug,
  FileCode2,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  EyeOff,
  Landmark,
  AlertTriangle,
} from "lucide-react";

interface NavigationProps {
  activeModule: string;
  onSelectModule?: (moduleId: string) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

interface NavItem {
  id: string;
  name: string;
  icon: typeof ShieldAlert;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Learn",
    items: [{ id: "learning-hub", name: "Learning Hub", icon: Compass }],
  },
  {
    label: "Defend with AI",
    items: [
      { id: "soc-analyst", name: "AI SOC Analyst", icon: ShieldAlert },
      { id: "threat-hunting", name: "AI Threat Hunting", icon: Search },
      { id: "pentest-assistant", name: "AI Pentest Assistant", icon: Terminal },
      { id: "malware-analysis", name: "AI Malware Analyst", icon: Bug },
      { id: "code-review", name: "AI Code Reviewer", icon: FileCode2 },
      { id: "ai-failure-lab", name: "AI Failure Lab", icon: AlertTriangle },
    ],
  },
  {
    label: "Secure AI",
    items: [
      { id: "prompt-injection", name: "Prompt Injection Lab", icon: Zap },
      { id: "jailbreak-lab", name: "Jailbreak Lab", icon: Lock },
      { id: "adversarial-ml", name: "Adversarial ML Lab", icon: Cpu },
      { id: "agent-security", name: "AI Agent Security Lab", icon: Bot },
      { id: "privacy-lab", name: "AI Data Privacy Lab", icon: EyeOff },
      { id: "governance", name: "AI Governance Simulator", icon: Landmark },
    ],
  },
];

export function Navigation({
  activeModule,
  onSelectModule,
  collapsed = false,
  onToggleCollapsed,
}: NavigationProps) {
  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} transition-[width] duration-200 bg-cyber-surface border-r border-cyber-border flex flex-col h-screen sticky top-0 select-none z-20`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-cyber-border flex items-center gap-3">
        <div className="w-9 h-9 shrink-0 rounded-md bg-accent/10 border border-accent/40 flex items-center justify-center text-accent">
          <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {!collapsed && (
          <div className="flex-1">
            <h1 className="text-sm font-semibold tracking-tight text-cyber-heading">
              AI Cybersecurity
            </h1>
            <p className="text-[11px] text-cyber-muted tracking-widest font-mono">
              PLAYGROUND v1.0
            </p>
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
          className="shrink-0 rounded-md p-1.5 text-cyber-muted transition-colors hover:bg-cyber-surface-hover hover:text-accent"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 py-1.5 text-[11px] font-mono tracking-widest text-cyber-muted uppercase">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((mod) => {
                const Icon = mod.icon;
                const isActive = mod.id === activeModule;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule && onSelectModule(mod.id)}
                    title={collapsed ? mod.name : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                      collapsed ? "justify-center px-0" : ""
                    } ${
                      isActive
                        ? "bg-accent/10 border border-accent/40 text-accent shadow-cyan-glow"
                        : "text-cyber-text hover:bg-cyber-surface-hover hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-accent" : "text-cyber-muted group-hover:text-accent"
                      }`}
                      strokeWidth={1.75}
                    />
                    {!collapsed && <span>{mod.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-cyber-border bg-cyber-base/50">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-mono text-cyber-muted">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYS_OK
            </span>
            <span>SOC_NODE_01</span>
          </div>
        )}
      </div>
    </aside>
  );
}
