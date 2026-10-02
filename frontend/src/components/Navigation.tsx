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
  Check,
} from "lucide-react";


interface NavigationProps {
  activeModule: string;
  onSelectModule?: (moduleId: string) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  completedIds?: string[];
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
      { id: "soc-analyst", name: "Log analysis", icon: ShieldAlert },
      { id: "threat-hunting", name: "Threat hunting", icon: Search },
      { id: "pentest-assistant", name: "Security assessment", icon: Terminal },
      { id: "malware-analysis", name: "Malware analysis", icon: Bug },
      { id: "code-review", name: "Code review", icon: FileCode2 },
      { id: "ai-failure-lab", name: "AI reliability", icon: AlertTriangle },
    ],
  },
  {
    label: "Secure AI",
    items: [
      { id: "prompt-injection", name: "Prompt injection", icon: Zap },
      { id: "jailbreak-lab", name: "Model safety", icon: Lock },
      { id: "adversarial-ml", name: "Adversarial ML", icon: Cpu },
      { id: "agent-security", name: "Agent security", icon: Bot },
      { id: "privacy-lab", name: "Data privacy", icon: EyeOff },
      { id: "governance", name: "Risk and governance", icon: Landmark },
    ],
  },
];

export function Navigation({
  activeModule,
  onSelectModule,
  collapsed = false,
  onToggleCollapsed,
  completedIds = [],
}: NavigationProps) {
  const completed = new Set(completedIds);
  return (
    <aside
      className={`${collapsed ? "w-16" : "w-60 max-[1100px]:fixed max-[1100px]:inset-y-0 max-[1100px]:left-0 max-[1100px]:shadow-lg"} transition-[width] duration-200 bg-cyber-surface border-r border-cyber-border flex flex-col h-screen sticky top-0 select-none z-30`}
    >
      {/* Brand Header */}
      <div className="p-3 border-b border-cyber-border flex items-center gap-3">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-cyber-surface-hover flex items-center justify-center text-cyber-heading">
          <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {!collapsed && (
          <div className="flex-1">
            <h1 className="text-sm font-semibold tracking-tight text-cyber-heading">
              AI Cybersecurity
            </h1>
            <p className="text-xs text-cyber-muted">
              Playground
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
              <div className="px-3 py-1.5 text-[11px] font-medium text-cyber-muted">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((mod) => {
                const Icon = mod.icon;
                const isActive = mod.id === activeModule;
                const isDone = completed.has(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule && onSelectModule(mod.id)}
                    title={mod.name}
                    aria-label={mod.name}
                    aria-current={isActive ? "page" : undefined}
                    className={`group w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                      collapsed ? "justify-center px-0" : ""
                    } ${
                      isActive
                        ? "bg-cyber-surface-hover text-cyber-heading"
                        : "text-cyber-muted hover:bg-cyber-surface-hover hover:text-cyber-heading"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-cyber-heading" : "text-cyber-muted"
                      }`}
                      strokeWidth={1.75}
                    />
                    {!collapsed && (
                      <span className="min-w-0 flex-1 truncate">{mod.name}</span>
                    )}
                    {!collapsed && isDone && (
                      <span
                        title="Completed"
                        className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-cyber-border text-xs text-cyber-muted">
        {collapsed ? <ShieldAlert className="mx-auto h-4 w-4" strokeWidth={1.75} /> : <><p className="font-medium text-cyber-heading">Built for practice</p><p className="mt-1 leading-relaxed">Simulated data and targets.<br />Learn safely at your own pace.</p></>}
      </div>
    </aside>
  );
}
