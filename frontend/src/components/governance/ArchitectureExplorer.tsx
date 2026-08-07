"use client";

import React, { useState } from "react";
import {
  Network,
  Server,
  Database,
  KeyRound,
  Bot,
  MonitorSmartphone,
  Box,
  Users,
  Activity,
  ShieldAlert,
  ArrowDown,
  ScrollText,
} from "lucide-react";
import type { GovernanceComponent } from "@/data/governance";

interface ArchitectureExplorerProps {
  architecture: GovernanceComponent[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const ROLE_ORDER: { role: string; label: string; icon: typeof Box }[] = [
  { role: "input", label: "Inputs & Users", icon: Users },
  { role: "data", label: "Data Sources", icon: Database },
  { role: "application", label: "Application", icon: MonitorSmartphone },
  { role: "gateway", label: "AI Gateway", icon: Network },
  { role: "model", label: "Model & Store", icon: Bot },
  { role: "support", label: "Support", icon: Activity },
];

function iconForRole(role: string) {
  switch (role) {
    case "input":
      return Users;
    case "data":
      return Database;
    case "application":
      return MonitorSmartphone;
    case "gateway":
      return KeyRound;
    case "model":
      return Bot;
    case "store":
      return Server;
    case "support":
      return Activity;
    default:
      return Box;
  }
}

export function ArchitectureExplorer({
  architecture,
  selectedId,
  onSelect,
}: ArchitectureExplorerProps) {
  const selected = architecture.find((c) => c.id === selectedId) ?? architecture[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Diagram - dominant visual */}
      <div className="lg:col-span-7 h-full">
        <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden h-full">
          <div className="px-4 py-3 border-b border-cyber-border bg-cyber-surface/60 flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
              System Architecture
            </h3>
            <span className="ml-auto text-[10px] font-mono text-slate-500">
              TRUST BOUNDARIES MARKED
            </span>
          </div>
          <div className="p-4 bg-grid-pattern space-y-1">
            {ROLE_ORDER.map((band, idx) => {
              const members = architecture.filter(
                (c) => c.role === band.role || (band.role === "model" && c.role === "store")
              );
              if (members.length === 0) return null;
              const BandIcon = band.icon;
              return (
                <div key={band.role}>
                  {idx > 0 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                  <div className="flex items-stretch gap-2">
                    <div className="w-24 shrink-0 flex flex-col justify-center gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <BandIcon className="w-3 h-3" /> {band.label}
                      </span>
                    </div>
                    <div className="flex-1 grid gap-2">
                      <div className={`grid gap-2 ${members.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {members.map((comp) => {
                          const Icon = iconForRole(comp.role);
                          const isSelected = comp.id === selectedId;
                          return (
                            <button
                              key={comp.id}
                              onClick={() => onSelect(comp.id)}
                              className={`p-2.5 rounded-md border text-left transition-all ${
                                isSelected
                                  ? "bg-cyan-950/40 border-cyan-500/60 shadow-cyan-glow"
                                  : "bg-slate-950/80 border-slate-800 hover:border-slate-600"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                                <span className="text-[11px] font-semibold text-cyber-heading leading-tight">
                                  {comp.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-cyber-muted leading-snug mt-1">{comp.purpose}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected component detail */}
      <div className="lg:col-span-5 h-full">
        {selected && (
          <div className="cyber-panel border border-cyan-500/30 rounded-lg p-4 h-full space-y-3">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
                {selected.name}
              </h3>
            </div>
            <p className="text-[12px] text-cyber-muted leading-snug">{selected.purpose}</p>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                Security Considerations
              </div>
              <ul className="space-y-1.5">
                {selected.security_considerations.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/70 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-red-500/30 bg-red-950/20 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-300 font-mono uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Attack Surface
              </div>
              <p className="text-[12px] text-slate-300 leading-snug">{selected.attack_surface}</p>
            </div>

            <div className="rounded-md border border-cyber-border bg-slate-900/40 p-2.5 text-[11px] text-cyber-muted leading-snug">
              Every component is a place a risk can live. Select the other nodes to see where
              threats attach, then step to the risk assessment.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
